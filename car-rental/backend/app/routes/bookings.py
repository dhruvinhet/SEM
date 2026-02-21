from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from app.auth import get_current_user, require_role
from app.database import bookings_col, vehicles_col, notifications_col, users_col, coupons_col, config_col
from app.models import (
    BookingCreateRequest, BookingCancelRequest, BookingResolveRequest,
    BookingStatus, LateReturnRequest, utcnow,
)
from app.pricing import calculate_price, calculate_refund, calculate_late_return_fee
from app.audit import log_audit
from app.config import settings

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


def booking_to_out(b: dict) -> dict:
    b["_id"] = str(b["_id"])
    b["vehicleId"] = str(b.get("vehicleId", ""))
    b["userId"] = str(b.get("userId", ""))
    b["ownerId"] = str(b.get("ownerId", ""))
    return b


async def check_availability(vehicle_id: str, start: datetime, end: datetime, exclude_booking_id: str = None):
    """Atomic availability check."""
    vehicle = await vehicles_col.find_one({"_id": ObjectId(vehicle_id)})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if vehicle.get("status") != "active":
        raise HTTPException(status_code=400, detail="Vehicle is not available for booking")

    for block in vehicle.get("availability", []):
        bs = block["start"] if isinstance(block["start"], datetime) else datetime.fromisoformat(str(block["start"]))
        be = block["end"] if isinstance(block["end"], datetime) else datetime.fromisoformat(str(block["end"]))
        if start < be and end > bs:
            raise HTTPException(status_code=409, detail="Vehicle is blocked/maintenance during selected dates")

    overlap_filter = {
        "vehicleId": vehicle_id,
        "status": {"$in": ["confirmed", "active", "held"]},
        "startDate": {"$lt": end},
        "endDate": {"$gt": start},
    }
    if exclude_booking_id:
        overlap_filter["_id"] = {"$ne": ObjectId(exclude_booking_id)}

    overlap = await bookings_col.find_one(overlap_filter)
    if overlap:
        raise HTTPException(status_code=409, detail="Vehicle already booked for these dates")

    return vehicle


async def send_notification(user_id: str, message: str, notif_type: str = "info", link: str = None):
    await notifications_col.insert_one({"userId": user_id, "message": message, "type": notif_type, "read": False, "link": link, "createdAt": utcnow()})


async def get_config_value(key: str, default):
    cfg = await config_col.find_one({"key": key})
    return cfg["value"] if cfg else default


@router.post("", status_code=201)
async def create_booking(req: BookingCreateRequest, user: dict = Depends(get_current_user)):
    """Create a booking with coupon, first-time discount, referral, blacklist check."""
    # Blacklist check
    if user.get("isBlacklisted"):
        raise HTTPException(status_code=403, detail="Your account has been suspended. Contact support.")

    existing = await bookings_col.find_one({"idempotencyKey": req.idempotencyKey})
    if existing:
        return booking_to_out(existing)

    if not ObjectId.is_valid(req.vehicleId):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    if req.startDate > req.endDate:
        raise HTTPException(status_code=400, detail="Start date must be before end date")

    end_dt = req.endDate if req.endDate > req.startDate else req.startDate + timedelta(days=1)
    now = utcnow()
    if req.startDate < now - timedelta(hours=1):
        raise HTTPException(status_code=400, detail="Cannot book in the past")

    vehicle = await check_availability(req.vehicleId, req.startDate, end_dt)
    pricing = vehicle.get("pricing", {})

    # First-time discount
    existing_count = await bookings_col.count_documents({"userId": user["_id"], "status": {"$in": ["confirmed", "active", "completed"]}})
    discounts = list(pricing.get("discounts", []) or [])
    if existing_count == 0:
        first_time_pct = await get_config_value("firstTimeDiscountPercent", settings.FIRST_TIME_DISCOUNT_PERCENT)
        discounts.append({"label": "First-time discount", "percent": first_time_pct})

    # Validate coupon if provided
    coupon_discount = 0.0
    coupon_code = None
    coupon_doc = None
    if req.couponCode:
        coupon_doc = await coupons_col.find_one({"code": req.couponCode.upper(), "isActive": True})
        if not coupon_doc:
            raise HTTPException(status_code=400, detail="Invalid or inactive coupon code")
        if coupon_doc.get("expiresAt") and utcnow() > coupon_doc["expiresAt"]:
            raise HTTPException(status_code=400, detail="Coupon has expired")
        if coupon_doc.get("usageLimit") and coupon_doc.get("usedCount", 0) >= coupon_doc["usageLimit"]:
            raise HTTPException(status_code=400, detail="Coupon usage limit reached")
        user_uses = await bookings_col.count_documents({"userId": user["_id"], "couponCode": req.couponCode.upper(), "status": {"$in": ["confirmed", "active", "completed"]}})
        per_user = coupon_doc.get("perUserLimit", 1)
        if user_uses >= per_user:
            raise HTTPException(status_code=400, detail="You have already used this coupon")
        if coupon_doc.get("firstTimeOnly") and existing_count > 0:
            raise HTTPException(status_code=400, detail="Coupon is for first-time users only")
        coupon_code = req.couponCode.upper()

    price_breakdown = calculate_price(
        start_date=req.startDate,
        end_date=end_dt,
        base_rate=pricing.get("baseRate", 0),
        weekend_rate=pricing.get("weekendRate"),
        peak_season_rate=pricing.get("peakSeasonRate"),
        peak_season_ranges=vehicle.get("peakSeasonRanges", []),
        discounts=discounts,
        cleaning_fee=pricing.get("cleaningFee", 0),
        security_deposit=pricing.get("securityDeposit", 0),
        coupon_code=coupon_code,
        coupon_discount=coupon_discount,
    )

    # Apply coupon discount post-price-calculation
    if coupon_doc:
        from app.pricing import apply_coupon_discount
        coupon_discount = apply_coupon_discount(coupon_doc, price_breakdown.total)
        price_breakdown.couponDiscount = coupon_discount
        price_breakdown.couponCode = coupon_code
        price_breakdown.total = max(0, price_breakdown.total - coupon_discount)

    hold_ttl = settings.HOLD_TTL_MINUTES
    hold_expires = now + timedelta(minutes=hold_ttl)
    approval_mode = vehicle.get("approvalMode", "auto")
    initial_status = "held" if approval_mode == "auto" else "pending"

    booking_doc = {
        "vehicleId": req.vehicleId,
        "userId": user["_id"],
        "ownerId": str(vehicle["ownerId"]),
        "startDate": req.startDate,
        "endDate": end_dt,
        "days": price_breakdown.days,
        "priceBreakdown": price_breakdown.model_dump(),
        "status": initial_status,
        "holdExpiresAt": hold_expires if initial_status == "held" else None,
        "idempotencyKey": req.idempotencyKey,
        "paymentMethod": req.paymentMethod,
        "couponCode": coupon_code,
        "cancellationPolicy": vehicle.get("cancellationPolicy", "moderate"),
        "lateReturnFee": 0.0,
        "createdAt": now,
        "updatedAt": now,
    }

    result = await bookings_col.insert_one(booking_doc)
    booking_doc["_id"] = result.inserted_id

    # Decrement coupon usage
    if coupon_doc:
        await coupons_col.update_one({"_id": coupon_doc["_id"]}, {"$inc": {"usedCount": 1}})

    # Increment vehicle totalBookings
    await vehicles_col.update_one({"_id": ObjectId(req.vehicleId)}, {"$inc": {"totalBookings": 1}})

    await log_audit(user["_id"], "booking_create", "booking", str(result.inserted_id))
    await send_notification(str(vehicle["ownerId"]), f"New booking request for {vehicle['title']}", "booking", "/owner/dashboard")

    out = booking_to_out(booking_doc)
    out["nextSteps"] = f"Complete payment within {hold_ttl} minutes to confirm" if initial_status == "held" else "Waiting for owner approval"
    return out


@router.get("")
async def list_bookings(status: Optional[str] = None, page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=200), user: dict = Depends(get_current_user)):
    filter_q = {}
    if user["role"] == "admin":
        pass
    elif user["role"] == "owner":
        filter_q["$or"] = [{"userId": user["_id"]}, {"ownerId": user["_id"]}]
    else:
        filter_q["userId"] = user["_id"]

    if status:
        filter_q["status"] = status

    skip = (page - 1) * limit
    total = await bookings_col.count_documents(filter_q)
    cursor = bookings_col.find(filter_q).sort("createdAt", -1).skip(skip).limit(limit)
    bookings = []
    async for b in cursor:
        bookings.append(booking_to_out(b))
    return {"items": bookings, "total": total, "page": page}


@router.get("/{booking_id}")
async def get_booking(booking_id: str, user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    booking = await bookings_col.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    b_user = str(booking.get("userId", ""))
    b_owner = str(booking.get("ownerId", ""))
    if user["role"] != "admin" and user["_id"] not in (b_user, b_owner):
        raise HTTPException(status_code=403, detail="Access denied")

    vehicle = None
    if ObjectId.is_valid(booking.get("vehicleId", "")):
        vehicle = await vehicles_col.find_one({"_id": ObjectId(booking["vehicleId"])})

    out = booking_to_out(booking)
    if vehicle:
        out["vehicle"] = {"title": vehicle.get("title", ""), "images": vehicle.get("images", []), "location": vehicle.get("location", ""), "cancellationPolicy": vehicle.get("cancellationPolicy", "moderate")}
    return out


@router.post("/{booking_id}/confirm")
async def confirm_booking(booking_id: str, user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    booking = await bookings_col.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    b_user = str(booking.get("userId", ""))
    b_owner = str(booking.get("ownerId", ""))
    if user["role"] != "admin" and user["_id"] not in (b_user, b_owner):
        raise HTTPException(status_code=403, detail="Access denied")

    if booking["status"] not in ("held", "pending"):
        raise HTTPException(status_code=400, detail=f"Cannot confirm booking in '{booking['status']}' status")

    if booking.get("holdExpiresAt"):
        hold_expires = booking["holdExpiresAt"]
        if isinstance(hold_expires, datetime) and hold_expires.tzinfo is None:
            hold_expires = hold_expires.replace(tzinfo=timezone.utc)
        if hold_expires and utcnow() > hold_expires:
            await bookings_col.update_one({"_id": ObjectId(booking_id)}, {"$set": {"status": "cancelled", "updatedAt": utcnow()}})
            raise HTTPException(status_code=400, detail="Hold has expired, booking cancelled")

    await check_availability(booking["vehicleId"], booking["startDate"], booking["endDate"], exclude_booking_id=booking_id)

    now = utcnow()
    new_status = "confirmed"
    start = booking["startDate"]
    if isinstance(start, datetime):
        if start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)
        if start <= now:
            new_status = "active"

    await bookings_col.update_one({"_id": ObjectId(booking_id)}, {"$set": {"status": new_status, "updatedAt": now}})
    await log_audit(user["_id"], "booking_confirm", "booking", booking_id)
    await send_notification(b_user, "Your booking has been confirmed!", "success", "/user/dashboard")

    updated = await bookings_col.find_one({"_id": ObjectId(booking_id)})
    return booking_to_out(updated)


@router.post("/{booking_id}/cancel")
async def cancel_booking(booking_id: str, req: BookingCancelRequest, user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    booking = await bookings_col.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    b_user = str(booking.get("userId", ""))
    b_owner = str(booking.get("ownerId", ""))
    if user["role"] != "admin" and user["_id"] not in (b_user, b_owner):
        raise HTTPException(status_code=403, detail="Access denied")

    cancellable = ("draft", "pending", "held", "confirmed")
    if booking["status"] not in cancellable:
        raise HTTPException(status_code=400, detail=f"Cannot cancel booking in '{booking['status']}' status")

    policy = booking.get("cancellationPolicy", "moderate")
    refund_amount = calculate_refund(booking, policy=policy) if booking["status"] in ("confirmed", "held") else 0.0

    await bookings_col.update_one({"_id": ObjectId(booking_id)}, {"$set": {"status": "cancelled", "cancelReason": req.reason or "User cancelled", "refundAmount": refund_amount, "updatedAt": utcnow()}})
    await log_audit(user["_id"], "booking_cancel", "booking", booking_id, {"refund": refund_amount})
    await send_notification(b_user if user["_id"] != b_user else b_owner, f"Booking cancelled. Refund: Rs.{refund_amount}", "warning")

    updated = await bookings_col.find_one({"_id": ObjectId(booking_id)})
    out = booking_to_out(updated)
    out["refundAmount"] = refund_amount
    return out


@router.post("/{booking_id}/late-return")
async def report_late_return(booking_id: str, req: LateReturnRequest, user: dict = Depends(get_current_user)):
    """Record a late return and calculate late fee."""
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    booking = await bookings_col.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    b_owner = str(booking.get("ownerId", ""))
    if user["role"] != "admin" and user["_id"] != b_owner:
        raise HTTPException(status_code=403, detail="Only the owner can report late returns")

    if booking["status"] not in ("active", "confirmed"):
        raise HTTPException(status_code=400, detail="Booking must be active to report late return")

    vehicle = await vehicles_col.find_one({"_id": ObjectId(booking["vehicleId"])})
    late_fee = calculate_late_return_fee(vehicle, booking["endDate"], req.actualReturnTime)

    await bookings_col.update_one({"_id": ObjectId(booking_id)}, {"$set": {"lateReturnFee": late_fee, "actualReturnTime": req.actualReturnTime, "status": "completed", "updatedAt": utcnow()}})
    await log_audit(user["_id"], "booking_late_return", "booking", booking_id, {"lateFee": late_fee})
    await send_notification(str(booking.get("userId", "")), f"Late return fee of Rs.{late_fee} has been applied.", "warning")

    return {"message": "Late return recorded", "lateReturnFee": late_fee}


@router.post("/{booking_id}/dispute")
async def open_dispute(booking_id: str, user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    booking = await bookings_col.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    b_user = str(booking.get("userId", ""))
    b_owner = str(booking.get("ownerId", ""))
    if user["_id"] not in (b_user, b_owner) and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    if booking["status"] not in ("active", "completed"):
        raise HTTPException(status_code=400, detail=f"Cannot dispute booking in '{booking['status']}' status")

    await bookings_col.update_one({"_id": ObjectId(booking_id)}, {"$set": {"status": "disputed", "updatedAt": utcnow()}})
    await log_audit(user["_id"], "booking_dispute", "booking", booking_id)
    return {"message": "Dispute opened", "status": "disputed"}


@router.post("/{booking_id}/resolve")
async def resolve_dispute(booking_id: str, req: BookingResolveRequest, user: dict = Depends(require_role("admin"))):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    booking = await bookings_col.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking["status"] != "disputed":
        raise HTTPException(status_code=400, detail="Booking is not in disputed status")

    policy = booking.get("cancellationPolicy", "moderate")
    refund_amount = calculate_refund(booking, policy=policy) if req.resolution == "refund" else 0
    new_status = "refunded" if req.resolution == "refund" else "completed"

    await bookings_col.update_one({"_id": ObjectId(booking_id)}, {"$set": {"status": new_status, "refundAmount": refund_amount, "adminNotes": req.notes, "updatedAt": utcnow()}})
    await log_audit(user["_id"], "booking_resolve", "booking", booking_id, {"resolution": req.resolution, "refund": refund_amount})

    b_user = str(booking.get("userId", ""))
    await send_notification(b_user, f"Your dispute has been resolved: {req.resolution}", "info")

    updated = await bookings_col.find_one({"_id": ObjectId(booking_id)})
    return booking_to_out(updated)
