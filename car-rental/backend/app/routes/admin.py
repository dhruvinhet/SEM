"""Full Admin Portal - analytics, CRUD, bulk ops, config, blacklist, announcements."""
import csv
import io
import math
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from bson import ObjectId
from passlib.hash import bcrypt
from app.auth import require_role
from app.database import (
    users_col, vehicles_col, bookings_col, payments_col,
    audit_logs_col, notifications_col, config_col,
    blacklist_col, coupons_col, verifications_col, announcements_col,
)
from app.models import (
    utcnow,
    AdminCreateUserRequest, AdminUpdateUserRequest,
    AdminCreateBookingRequest,
    BulkApproveRequest, BulkCancelRequest,
    ConfigUpdateRequest,
    BlacklistRequest,
)
from app.audit import log_audit

router = APIRouter(prefix="/api/admin", tags=["admin"])


async def _compute_owner_analytics(owner_id: str, range: str = "monthly"):
    """Shared owner analytics computation."""
    now = utcnow()
    if range == "weekly":
        start = now - timedelta(days=7)
    elif range == "yearly":
        start = now - timedelta(days=365)
    else:
        start = now - timedelta(days=30)

    owner_vehicles_cursor = vehicles_col.find({"ownerId": {"$in": [owner_id, ObjectId(owner_id) if ObjectId.is_valid(owner_id) else None]}})
    vehicle_ids = []
    async for v in owner_vehicles_cursor:
        vehicle_ids.append(str(v["_id"]))

    if not vehicle_ids:
        return {"error": "No vehicles found for owner", "vehicleIds": []}

    bookings_query = {"ownerId": owner_id, "createdAt": {"$gte": start}}
    total_bookings = await bookings_col.count_documents({"ownerId": owner_id})
    period_bookings = await bookings_col.count_documents(bookings_query)
    period_cancelled = await bookings_col.count_documents({**bookings_query, "status": "cancelled"})
    period_completed = await bookings_col.count_documents({**bookings_query, "status": {"$in": ["completed", "archived"]}})

    revenue_pipeline = [
        {"$match": {"ownerId": owner_id, "status": {"$in": ["confirmed", "active", "completed"]}, "createdAt": {"$gte": start}}},
        {"$group": {"_id": None, "revenue": {"$sum": "$priceBreakdown.total"}}},
    ]
    rev_result = await bookings_col.aggregate(revenue_pipeline).to_list(1)
    period_revenue = rev_result[0]["revenue"] if rev_result else 0

    commission_cfg = await config_col.find_one({"key": "platformCommissionPercent"})
    commission_rate = commission_cfg["value"] if commission_cfg else 15.0
    owner_earnings = round(period_revenue * (1 - commission_rate / 100), 2)

    days_in_period = (now - start).days or 1
    if vehicle_ids and days_in_period > 0:
        booked_days_pipeline = [
            {"$match": {"ownerId": owner_id, "status": {"$in": ["confirmed", "active", "completed"]}, "startDate": {"$gte": start}}},
            {"$group": {"_id": None, "totalDays": {"$sum": "$days"}}},
        ]
        bd_result = await bookings_col.aggregate(booked_days_pipeline).to_list(1)
        total_booked_days = bd_result[0]["totalDays"] if bd_result else 0
        max_possible = days_in_period * len(vehicle_ids)
        occupancy_rate = round(total_booked_days / max_possible * 100, 1) if max_possible > 0 else 0
    else:
        occupancy_rate = 0

    cancellation_rate = round(period_cancelled / period_bookings * 100, 1) if period_bookings > 0 else 0
    daily_avg = owner_earnings / days_in_period if days_in_period > 0 else 0
    monthly_projection = round(daily_avg * 30, 2)

    monthly_pipeline = [
        {"$match": {"ownerId": owner_id, "status": {"$in": ["confirmed", "active", "completed"]}}},
        {"$group": {"_id": {"year": {"$year": "$createdAt"}, "month": {"$month": "$createdAt"}}, "revenue": {"$sum": "$priceBreakdown.total"}, "bookings": {"$sum": 1}}},
        {"$sort": {"_id.year": 1, "_id.month": 1}},
        {"$limit": 12},
    ]
    monthly_trend = await bookings_col.aggregate(monthly_pipeline).to_list(12)

    return {
        "period": range,
        "totalBookings": total_bookings,
        "periodBookings": period_bookings,
        "periodRevenue": period_revenue,
        "ownerEarnings": owner_earnings,
        "occupancyRate": occupancy_rate,
        "cancellationRate": cancellation_rate,
        "monthlyProjection": monthly_projection,
        "monthlyTrend": [{"month": f"{m['_id']['year']}-{str(m['_id']['month']).zfill(2)}", "revenue": m["revenue"], "bookings": m["bookings"]} for m in monthly_trend],
    }


@router.get("/analytics")
async def get_analytics(
    range: str = Query("monthly", pattern="^(weekly|monthly|yearly)$"),
    user: dict = Depends(require_role("admin")),
):
    """Get aggregated analytics - GMV, commission, bookings, conversions, fraud alerts."""
    now = utcnow()
    if range == "weekly":
        start = now - timedelta(days=7)
    elif range == "monthly":
        start = now - timedelta(days=30)
    else:
        start = now - timedelta(days=365)

    total_users = await users_col.count_documents({})
    total_owners = await users_col.count_documents({"role": "owner"})
    total_vehicles = await vehicles_col.count_documents({"status": "active"})
    total_bookings = await bookings_col.count_documents({})
    period_bookings = await bookings_col.count_documents({"createdAt": {"$gte": start}})
    period_cancelled = await bookings_col.count_documents({"status": "cancelled", "updatedAt": {"$gte": start}})
    period_completed = await bookings_col.count_documents({"status": {"$in": ["completed", "archived"]}, "updatedAt": {"$gte": start}})

    gmv_pipeline = [
        {"$match": {"status": {"$in": ["confirmed", "active", "completed"]}, "createdAt": {"$gte": start}}},
        {"$group": {"_id": None, "gmv": {"$sum": "$priceBreakdown.total"}}},
    ]
    gmv_result = await bookings_col.aggregate(gmv_pipeline).to_list(1)
    gmv = gmv_result[0]["gmv"] if gmv_result else 0

    commission_cfg = await config_col.find_one({"key": "platformCommissionPercent"})
    commission_rate = commission_cfg["value"] if commission_cfg else 15.0
    period_commission = round(gmv * commission_rate / 100, 2)

    revenue_pipeline = [
        {"$match": {"status": "succeeded", "createdAt": {"$gte": start}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]
    revenue_result = await payments_col.aggregate(revenue_pipeline).to_list(1)
    period_revenue = revenue_result[0]["total"] if revenue_result else 0

    monthly_pipeline = [
        {"$match": {"status": "succeeded"}},
        {"$group": {"_id": {"year": {"$year": "$createdAt"}, "month": {"$month": "$createdAt"}}, "revenue": {"$sum": "$amount"}, "count": {"$sum": 1}}},
        {"$sort": {"_id.year": 1, "_id.month": 1}},
        {"$limit": 12},
    ]
    monthly_trend = await payments_col.aggregate(monthly_pipeline).to_list(12)

    top_vehicles_pipeline = [
        {"$match": {"status": {"$in": ["confirmed", "active", "completed"]}}},
        {"$group": {"_id": "$vehicleId", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5},
    ]
    top_vehicles_raw = await bookings_col.aggregate(top_vehicles_pipeline).to_list(5)
    top_vehicles = []
    for tv in top_vehicles_raw:
        vid = tv["_id"]
        if ObjectId.is_valid(vid):
            v = await vehicles_col.find_one({"_id": ObjectId(vid)})
            if v:
                top_vehicles.append({"vehicleId": vid, "title": v.get("title", "Unknown"), "bookings": tv["count"]})

    status_pipeline = [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    status_dist = await bookings_col.aggregate(status_pipeline).to_list(20)

    city_pipeline = [
        {"$match": {"status": "active", "location": {"$exists": True, "$ne": ""}}},
        {"$group": {"_id": "$location", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]
    cities_raw = await vehicles_col.aggregate(city_pipeline).to_list(10)

    user_growth_pipeline = [
        {"$group": {"_id": {"year": {"$year": "$createdAt"}, "month": {"$month": "$createdAt"}}, "newUsers": {"$sum": 1}}},
        {"$sort": {"_id.year": 1, "_id.month": 1}},
        {"$limit": 12},
    ]
    user_growth = await users_col.aggregate(user_growth_pipeline).to_list(12)

    fraud_pipeline = [
        {"$match": {"status": "disputed"}},
        {"$group": {"_id": "$userId", "disputes": {"$sum": 1}}},
        {"$match": {"disputes": {"$gte": 2}}},
        {"$sort": {"disputes": -1}},
        {"$limit": 10},
    ]
    fraud_raw = await bookings_col.aggregate(fraud_pipeline).to_list(10)
    fraud_alerts = []
    for fr in fraud_raw:
        uid = fr["_id"]
        u = await users_col.find_one({"_id": ObjectId(uid)}, {"passwordHash": 0}) if ObjectId.is_valid(uid) else None
        if u:
            fraud_alerts.append({"userId": uid, "name": u.get("name", "Unknown"), "email": u.get("email", ""), "disputes": fr["disputes"]})

    conversion_rate = round(period_completed / period_bookings * 100, 1) if period_bookings > 0 else 0
    cancellation_rate = round(period_cancelled / period_bookings * 100, 1) if period_bookings > 0 else 0

    return {
        "summary": {"totalUsers": total_users, "totalOwners": total_owners, "totalVehicles": total_vehicles, "totalBookings": total_bookings},
        "period": {"range": range, "bookings": period_bookings, "cancelled": period_cancelled, "completed": period_completed, "revenue": period_revenue, "gmv": gmv, "commissionRevenue": period_commission, "conversionRate": conversion_rate, "cancellationRate": cancellation_rate},
        "monthlyTrend": [{"month": f"{m['_id']['year']}-{str(m['_id']['month']).zfill(2)}", "revenue": m["revenue"], "count": m["count"]} for m in monthly_trend],
        "topVehicles": top_vehicles,
        "statusDistribution": [{"status": s["_id"], "count": s["count"]} for s in status_dist],
        "topCities": [{"city": c["_id"], "vehicles": c["count"]} for c in cities_raw],
        "userGrowth": [{"month": f"{g['_id']['year']}-{str(g['_id']['month']).zfill(2)}", "newUsers": g["newUsers"]} for g in user_growth],
        "fraudAlerts": fraud_alerts,
    }


@router.get("/bookings")
async def admin_list_bookings(
    status: Optional[str] = None, start_date: Optional[str] = None, end_date: Optional[str] = None,
    user_id: Optional[str] = None, vehicle_id: Optional[str] = None,
    page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
    user: dict = Depends(require_role("admin")),
):
    filter_q = {}
    if status: filter_q["status"] = status
    if start_date: filter_q["startDate"] = {"$gte": datetime.fromisoformat(start_date)}
    if end_date: filter_q.setdefault("endDate", {})["$lte"] = datetime.fromisoformat(end_date)
    if user_id: filter_q["userId"] = user_id
    if vehicle_id: filter_q["vehicleId"] = vehicle_id
    skip = (page - 1) * limit
    total = await bookings_col.count_documents(filter_q)
    cursor = bookings_col.find(filter_q).sort("createdAt", -1).skip(skip).limit(limit)
    bookings = []
    async for b in cursor:
        b["_id"] = str(b["_id"])
        b["vehicleId"] = str(b.get("vehicleId", ""))
        b["userId"] = str(b.get("userId", ""))
        b["ownerId"] = str(b.get("ownerId", ""))
        bookings.append(b)
    return {"items": bookings, "total": total, "page": page}


@router.post("/bookings")
async def admin_create_booking(req: AdminCreateBookingRequest, admin: dict = Depends(require_role("admin"))):
    """Admin: Create a booking on behalf of a user."""
    from app.routes.bookings import check_availability
    from app.pricing import calculate_price as cp
    import uuid
    if not ObjectId.is_valid(req.vehicleId):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    if not ObjectId.is_valid(req.userId):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    vehicle = await check_availability(req.vehicleId, req.startDate, req.endDate)
    pricing = vehicle.get("pricing", {})
    price_breakdown = cp(start_date=req.startDate, end_date=req.endDate, base_rate=pricing.get("baseRate", 0), weekend_rate=pricing.get("weekendRate"), peak_season_rate=pricing.get("peakSeasonRate"), peak_season_ranges=vehicle.get("peakSeasonRanges", []), discounts=pricing.get("discounts"), cleaning_fee=pricing.get("cleaningFee", 0), security_deposit=pricing.get("securityDeposit", 0))
    now = utcnow()
    doc = {"vehicleId": req.vehicleId, "userId": req.userId, "ownerId": str(vehicle["ownerId"]), "startDate": req.startDate, "endDate": req.endDate, "days": price_breakdown.days, "priceBreakdown": price_breakdown.model_dump(), "status": "confirmed", "idempotencyKey": f"admin-{uuid.uuid4().hex}", "paymentMethod": req.paymentMethod, "createdAt": now, "updatedAt": now, "createdByAdmin": admin["_id"]}
    result = await bookings_col.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    await log_audit(admin["_id"], "booking_admin_create", "booking", str(result.inserted_id))
    return doc


@router.post("/bookings/{booking_id}/cancel")
async def admin_cancel_booking(booking_id: str, reason: str = "Admin cancelled", user: dict = Depends(require_role("admin"))):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    booking = await bookings_col.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    from app.pricing import calculate_refund
    refund = calculate_refund(booking, policy=booking.get("cancellationPolicy", "moderate"))
    await bookings_col.update_one({"_id": ObjectId(booking_id)}, {"$set": {"status": "cancelled", "cancelReason": reason, "refundAmount": refund, "updatedAt": utcnow()}})
    await log_audit(user["_id"], "booking_admin_cancel", "booking", booking_id, {"refund": refund})
    return {"message": "Booking cancelled", "refundAmount": refund}


@router.post("/bookings/bulk-cancel")
async def bulk_cancel_bookings(req: BulkCancelRequest, user: dict = Depends(require_role("admin"))):
    from app.pricing import calculate_refund
    cancelled, errors = [], []
    for bid in req.bookingIds:
        try:
            if not ObjectId.is_valid(bid):
                errors.append({"id": bid, "error": "Invalid ID"}); continue
            booking = await bookings_col.find_one({"_id": ObjectId(bid)})
            if not booking:
                errors.append({"id": bid, "error": "Not found"}); continue
            refund = calculate_refund(booking)
            await bookings_col.update_one({"_id": ObjectId(bid)}, {"$set": {"status": "cancelled", "cancelReason": req.reason, "refundAmount": refund, "updatedAt": utcnow()}})
            await log_audit(user["_id"], "booking_bulk_cancel", "booking", bid)
            cancelled.append(bid)
        except Exception as e:
            errors.append({"id": bid, "error": str(e)})
    return {"cancelled": cancelled, "errors": errors}


@router.get("/bookings/export")
async def export_bookings_csv(status: Optional[str] = None, start_date: Optional[str] = None, end_date: Optional[str] = None, user: dict = Depends(require_role("admin"))):
    filter_q = {}
    if status: filter_q["status"] = status
    if start_date: filter_q["createdAt"] = {"$gte": datetime.fromisoformat(start_date)}
    if end_date: filter_q.setdefault("createdAt", {})["$lte"] = datetime.fromisoformat(end_date)
    cursor = bookings_col.find(filter_q).sort("createdAt", -1)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["BookingID", "VehicleID", "UserID", "OwnerID", "StartDate", "EndDate", "Days", "Total", "Status", "CreatedAt"])
    async for b in cursor:
        writer.writerow([str(b["_id"]), str(b.get("vehicleId", "")), str(b.get("userId", "")), str(b.get("ownerId", "")), b.get("startDate", ""), b.get("endDate", ""), b.get("days", 0), b.get("priceBreakdown", {}).get("total", 0), b.get("status", ""), b.get("createdAt", "")])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=bookings_export.csv"})


@router.get("/vehicles")
async def admin_list_vehicles(status: Optional[str] = None, owner_id: Optional[str] = None, page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100), user: dict = Depends(require_role("admin"))):
    filter_q = {}
    if status: filter_q["status"] = status
    if owner_id: filter_q["ownerId"] = {"$in": [owner_id, ObjectId(owner_id) if ObjectId.is_valid(owner_id) else None]}
    skip = (page - 1) * limit
    total = await vehicles_col.count_documents(filter_q)
    cursor = vehicles_col.find(filter_q).sort("createdAt", -1).skip(skip).limit(limit)
    vehicles = []
    async for v in cursor:
        v["_id"] = str(v["_id"])
        v["ownerId"] = str(v["ownerId"])
        vehicles.append(v)
    return {"items": vehicles, "total": total, "page": page}


@router.post("/vehicles/{vehicle_id}/approve")
async def approve_vehicle(vehicle_id: str, user: dict = Depends(require_role("admin"))):
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    await vehicles_col.update_one({"_id": ObjectId(vehicle_id)}, {"$set": {"status": "active", "updatedAt": utcnow()}})
    await log_audit(user["_id"], "vehicle_approve", "vehicle", vehicle_id)
    return {"message": "Vehicle approved"}


@router.post("/vehicles/{vehicle_id}/reject")
async def reject_vehicle(vehicle_id: str, reason: str = "", user: dict = Depends(require_role("admin"))):
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    await vehicles_col.update_one({"_id": ObjectId(vehicle_id)}, {"$set": {"status": "removed", "rejectionReason": reason, "updatedAt": utcnow()}})
    await log_audit(user["_id"], "vehicle_reject", "vehicle", vehicle_id, {"reason": reason})
    return {"message": "Vehicle rejected"}


@router.post("/vehicles/bulk-approve")
async def bulk_approve_vehicles(req: BulkApproveRequest, user: dict = Depends(require_role("admin"))):
    approved, errors = [], []
    for vid in req.vehicleIds:
        try:
            if not ObjectId.is_valid(vid):
                errors.append({"id": vid, "error": "Invalid ID"}); continue
            await vehicles_col.update_one({"_id": ObjectId(vid)}, {"$set": {"status": "active", "updatedAt": utcnow()}})
            await log_audit(user["_id"], "vehicle_bulk_approve", "vehicle", vid)
            approved.append(vid)
        except Exception as e:
            errors.append({"id": vid, "error": str(e)})
    return {"approved": approved, "errors": errors}


@router.put("/vehicles/{vehicle_id}")
async def admin_update_vehicle(vehicle_id: str, req: dict, user: dict = Depends(require_role("admin"))):
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    req["updatedAt"] = utcnow()
    await vehicles_col.update_one({"_id": ObjectId(vehicle_id)}, {"$set": req})
    await log_audit(user["_id"], "vehicle_admin_update", "vehicle", vehicle_id)
    updated = await vehicles_col.find_one({"_id": ObjectId(vehicle_id)})
    if updated:
        updated["_id"] = str(updated["_id"])
        updated["ownerId"] = str(updated.get("ownerId", ""))
    return updated


@router.delete("/vehicles/{vehicle_id}")
async def admin_delete_vehicle(vehicle_id: str, user: dict = Depends(require_role("admin"))):
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    await vehicles_col.update_one({"_id": ObjectId(vehicle_id)}, {"$set": {"status": "removed", "updatedAt": utcnow()}})
    await log_audit(user["_id"], "vehicle_admin_delete", "vehicle", vehicle_id)
    return {"message": "Vehicle removed"}


@router.get("/users")
async def admin_list_users(role: Optional[str] = None, search: Optional[str] = None, page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100), user: dict = Depends(require_role("admin"))):
    filter_q = {}
    if role: filter_q["role"] = role
    if search: filter_q["$or"] = [{"name": {"$regex": search, "$options": "i"}}, {"email": {"$regex": search, "$options": "i"}}]
    skip = (page - 1) * limit
    total = await users_col.count_documents(filter_q)
    cursor = users_col.find(filter_q, {"passwordHash": 0}).sort("createdAt", -1).skip(skip).limit(limit)
    users_list = []
    async for u in cursor:
        u["_id"] = str(u["_id"])
        users_list.append(u)
    return {"items": users_list, "total": total, "page": page}


@router.post("/users", status_code=201)
async def admin_create_user(req: AdminCreateUserRequest, admin: dict = Depends(require_role("admin"))):
    existing = await users_col.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    import secrets
    hashed = bcrypt.hash(req.password)
    now = utcnow()
    doc = {"name": req.name, "email": req.email, "passwordHash": hashed, "role": req.role, "verified": True, "isVerified": False, "isBlacklisted": False, "referralCode": secrets.token_urlsafe(8), "referralCount": 0, "createdAt": now, "updatedAt": now}
    result = await users_col.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    del doc["passwordHash"]
    await log_audit(admin["_id"], "user_admin_create", "user", str(result.inserted_id))
    return doc


@router.put("/users/{user_id}")
async def admin_update_user(user_id: str, req: AdminUpdateUserRequest, admin: dict = Depends(require_role("admin"))):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    update_data = {k: v for k, v in req.model_dump(exclude_none=True).items()}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    update_data["updatedAt"] = utcnow()
    await users_col.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    await log_audit(admin["_id"], "user_admin_update", "user", user_id, update_data)
    updated = await users_col.find_one({"_id": ObjectId(user_id)}, {"passwordHash": 0})
    if updated: updated["_id"] = str(updated["_id"])
    return updated


@router.delete("/users/{user_id}")
async def admin_delete_user(user_id: str, admin: dict = Depends(require_role("admin"))):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    await users_col.update_one({"_id": ObjectId(user_id)}, {"$set": {"isDeleted": True, "updatedAt": utcnow()}})
    await log_audit(admin["_id"], "user_admin_delete", "user", user_id)
    return {"message": "User deactivated"}


@router.post("/users/blacklist")
async def blacklist_user(req: BlacklistRequest, admin: dict = Depends(require_role("admin"))):
    if not ObjectId.is_valid(req.userId):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    now = utcnow()
    await users_col.update_one({"_id": ObjectId(req.userId)}, {"$set": {"isBlacklisted": True, "blacklistReason": req.reason, "updatedAt": now}})
    await blacklist_col.update_one({"userId": req.userId}, {"$set": {"userId": req.userId, "reason": req.reason, "blacklistedBy": admin["_id"], "createdAt": now}}, upsert=True)
    await log_audit(admin["_id"], "user_blacklist", "user", req.userId, {"reason": req.reason})
    return {"message": "User blacklisted"}


@router.post("/users/{user_id}/unblacklist")
async def unblacklist_user(user_id: str, admin: dict = Depends(require_role("admin"))):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    await users_col.update_one({"_id": ObjectId(user_id)}, {"$set": {"isBlacklisted": False, "updatedAt": utcnow()}, "$unset": {"blacklistReason": ""}})
    await blacklist_col.delete_one({"userId": user_id})
    await log_audit(admin["_id"], "user_unblacklist", "user", user_id)
    return {"message": "User removed from blacklist"}


@router.get("/blacklist")
async def list_blacklisted(user: dict = Depends(require_role("admin"))):
    cursor = blacklist_col.find({}).sort("createdAt", -1)
    items = []
    async for bl in cursor:
        bl["_id"] = str(bl["_id"])
        uid = bl.get("userId", "")
        if ObjectId.is_valid(uid):
            u = await users_col.find_one({"_id": ObjectId(uid)}, {"passwordHash": 0})
            if u: bl["user"] = {"name": u.get("name"), "email": u.get("email")}
        items.append(bl)
    return {"items": items}


@router.get("/audit-logs")
async def get_audit_logs(action: Optional[str] = None, resource_type: Optional[str] = None, actor_id: Optional[str] = None, page: int = Query(1, ge=1), limit: int = Query(50, ge=1, le=100), user: dict = Depends(require_role("admin"))):
    filter_q = {}
    if action: filter_q["action"] = action
    if resource_type: filter_q["resourceType"] = resource_type
    if actor_id: filter_q["actorId"] = actor_id
    skip = (page - 1) * limit
    total = await audit_logs_col.count_documents(filter_q)
    cursor = audit_logs_col.find(filter_q).sort("createdAt", -1).skip(skip).limit(limit)
    logs = []
    async for log in cursor:
        log["_id"] = str(log["_id"])
        logs.append(log)
    return {"items": logs, "total": total, "page": page}


@router.get("/config")
async def get_config(user: dict = Depends(require_role("admin"))):
    cursor = config_col.find({})
    configs = []
    async for c in cursor:
        c["_id"] = str(c["_id"])
        configs.append(c)
    return {"items": configs}


@router.put("/config/{key}")
async def update_config(key: str, req: ConfigUpdateRequest, user: dict = Depends(require_role("admin"))):
    allowed_keys = ["gstPercentage", "serviceFeePercentage", "firstTimeDiscountPercent", "referralDiscountPercent", "platformCommissionPercent", "surgePricingEnabled", "maxLateHours", "maintenanceMode"]
    if key not in allowed_keys:
        raise HTTPException(status_code=400, detail=f"Key '{key}' is not configurable. Allowed: {allowed_keys}")
    now = utcnow()
    await config_col.update_one({"key": key}, {"$set": {"key": key, "value": req.value, "description": req.description, "updatedAt": now, "updatedBy": user["_id"]}}, upsert=True)
    await log_audit(user["_id"], "config_update", "config", key, {"value": req.value})
    updated = await config_col.find_one({"key": key})
    if updated: updated["_id"] = str(updated["_id"])
    return updated


@router.get("/payments")
async def admin_list_payments(booking_id: Optional[str] = None, status: Optional[str] = None, page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100), user: dict = Depends(require_role("admin"))):
    filter_q = {}
    if booking_id: filter_q["bookingId"] = booking_id
    if status: filter_q["status"] = status
    skip = (page - 1) * limit
    total = await payments_col.count_documents(filter_q)
    cursor = payments_col.find(filter_q).sort("createdAt", -1).skip(skip).limit(limit)
    payments = []
    async for p in cursor:
        p["_id"] = str(p["_id"])
        payments.append(p)
    return {"items": payments, "total": total, "page": page}


@router.post("/payments/refund")
async def admin_refund_payment(booking_id: str, amount: Optional[float] = None, user: dict = Depends(require_role("admin"))):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    booking = await bookings_col.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    original_payment = await payments_col.find_one({"bookingId": booking_id, "status": "succeeded"})
    if not original_payment:
        raise HTTPException(status_code=404, detail="No succeeded payment found for this booking")
    original_amount = original_payment.get("amount", 0)
    refund_amount = amount if amount is not None else original_amount
    if refund_amount > original_amount:
        raise HTTPException(status_code=400, detail="Refund cannot exceed original payment amount")
    import uuid
    now = utcnow()
    refund_doc = {"bookingId": booking_id, "method": "refund", "amount": -refund_amount, "status": "refunded", "transactionRef": f"refund_{uuid.uuid4().hex[:8]}", "originalPaymentId": str(original_payment["_id"]), "initiatedBy": user["_id"], "createdAt": now}
    await payments_col.insert_one(refund_doc)
    await payments_col.update_one({"_id": original_payment["_id"]}, {"$set": {"status": "refunded", "updatedAt": now}})
    await bookings_col.update_one({"_id": ObjectId(booking_id)}, {"$set": {"status": "refunded", "refundAmount": refund_amount, "updatedAt": now}})
    await log_audit(user["_id"], "payment_admin_refund", "payment", booking_id, {"amount": refund_amount})
    return {"message": f"Refund of Rs.{refund_amount} processed", "refundAmount": refund_amount}


@router.get("/disputes")
async def admin_list_disputes(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100), user: dict = Depends(require_role("admin"))):
    filter_q = {"status": "disputed"}
    skip = (page - 1) * limit
    total = await bookings_col.count_documents(filter_q)
    cursor = bookings_col.find(filter_q).sort("updatedAt", -1).skip(skip).limit(limit)
    disputes = []
    async for b in cursor:
        b["_id"] = str(b["_id"])
        b["vehicleId"] = str(b.get("vehicleId", ""))
        b["userId"] = str(b.get("userId", ""))
        b["ownerId"] = str(b.get("ownerId", ""))
        disputes.append(b)
    return {"items": disputes, "total": total, "page": page}


@router.get("/owner-analytics/{owner_id}")
async def get_owner_analytics(owner_id: str, range: str = Query("monthly", pattern="^(weekly|monthly|yearly)$"), user: dict = Depends(require_role("admin"))):
    return await _compute_owner_analytics(owner_id, range)


@router.get("/owner-stats/{owner_id}")
async def admin_get_owner_stats(owner_id: str, range: str = Query("monthly"), user: dict = Depends(require_role("admin"))):
    return await _compute_owner_analytics(owner_id, range)
