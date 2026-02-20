import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.auth import get_current_user, require_role
from app.database import payments_col, bookings_col
from app.models import PaymentChargeRequest, PaymentRefundRequest, PaymentStatus, utcnow
from app.audit import log_audit

router = APIRouter(prefix="/api/payments", tags=["payments"])


def payment_to_out(p: dict) -> dict:
    p["_id"] = str(p["_id"])
    p["bookingId"] = str(p.get("bookingId", ""))
    return p


@router.post("/charge", status_code=201)
async def charge_payment(
    req: PaymentChargeRequest,
    user: dict = Depends(get_current_user),
):
    """Simulate a payment charge. In production, integrate with payment gateway."""
    if not ObjectId.is_valid(req.bookingId):
        raise HTTPException(status_code=400, detail="Invalid booking ID")

    booking = await bookings_col.find_one({"_id": ObjectId(req.bookingId)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if str(booking.get("userId", "")) != user["_id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    if booking["status"] not in ("held", "pending"):
        raise HTTPException(status_code=400, detail=f"Cannot charge for booking in '{booking['status']}' status")

    # Simulate payment (always succeeds for mock_card)
    payment_status = "succeeded"
    transaction_ref = f"txn_{uuid.uuid4().hex[:12]}"

    # Simulate failure for testing: if method contains "fail"
    if "fail" in req.method.lower():
        payment_status = "failed"
        transaction_ref = None

    payment_doc = {
        "bookingId": req.bookingId,
        "method": req.method,
        "amount": req.amount,
        "status": payment_status,
        "transactionRef": transaction_ref,
        "createdAt": utcnow(),
    }

    result = await payments_col.insert_one(payment_doc)
    payment_doc["_id"] = result.inserted_id

    # Update booking status based on payment result
    if payment_status == "succeeded":
        await bookings_col.update_one(
            {"_id": ObjectId(req.bookingId)},
            {"$set": {"status": "confirmed", "updatedAt": utcnow()}},
        )
    elif payment_status == "failed":
        await bookings_col.update_one(
            {"_id": ObjectId(req.bookingId)},
            {"$set": {"status": "cancelled", "updatedAt": utcnow()}},
        )

    await log_audit(user["_id"], "payment_charge", "payment", str(result.inserted_id), {
        "amount": req.amount,
        "status": payment_status,
    })

    return payment_to_out(payment_doc)


@router.post("/refund")
async def refund_payment(
    req: PaymentRefundRequest,
    user: dict = Depends(require_role("admin")),
):
    """Process refund (admin only)."""
    if not ObjectId.is_valid(req.bookingId):
        raise HTTPException(status_code=400, detail="Invalid booking ID")

    # Find original payment
    payment = await payments_col.find_one({
        "bookingId": req.bookingId,
        "status": "succeeded",
    })
    if not payment:
        raise HTTPException(status_code=404, detail="No successful payment found for this booking")

    refund_amount = req.amount if req.amount else payment["amount"]
    if refund_amount > payment["amount"]:
        raise HTTPException(status_code=400, detail="Refund amount exceeds original payment")

    refund_doc = {
        "bookingId": req.bookingId,
        "method": payment["method"],
        "amount": -refund_amount,
        "status": "refunded",
        "transactionRef": f"rfnd_{uuid.uuid4().hex[:12]}",
        "createdAt": utcnow(),
    }

    result = await payments_col.insert_one(refund_doc)
    refund_doc["_id"] = result.inserted_id

    # Update original payment status
    await payments_col.update_one(
        {"_id": payment["_id"]},
        {"$set": {"status": "refunded"}},
    )

    # Update booking
    await bookings_col.update_one(
        {"_id": ObjectId(req.bookingId)},
        {"$set": {"status": "refunded", "refundAmount": refund_amount, "updatedAt": utcnow()}},
    )

    await log_audit(user["_id"], "payment_refund", "payment", str(result.inserted_id), {
        "amount": refund_amount,
    })

    return payment_to_out(refund_doc)


@router.get("/booking/{booking_id}")
async def get_booking_payments(
    booking_id: str,
    user: dict = Depends(get_current_user),
):
    """Get all payments for a booking."""
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")

    booking = await bookings_col.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    b_user = str(booking.get("userId", ""))
    b_owner = str(booking.get("ownerId", ""))
    if user["role"] != "admin" and user["_id"] not in (b_user, b_owner):
        raise HTTPException(status_code=403, detail="Access denied")

    cursor = payments_col.find({"bookingId": booking_id}).sort("createdAt", -1)
    payments = []
    async for p in cursor:
        payments.append(payment_to_out(p))

    return {"payments": payments}
