"""Coupon management routes — create, validate, apply coupons."""
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from app.auth import get_current_user, require_role
from app.database import coupons_col, bookings_col
from app.models import (
    CouponCreateRequest, CouponValidateRequest, utcnow,
)
from app.pricing import apply_coupon_discount
from app.audit import log_audit

router = APIRouter(prefix="/api/coupons", tags=["coupons"])


def coupon_to_out(c: dict) -> dict:
    c["_id"] = str(c["_id"])
    return c


@router.post("", status_code=201)
async def create_coupon(
    req: CouponCreateRequest,
    user: dict = Depends(require_role("admin")),
):
    """Admin: Create a new coupon."""
    existing = await coupons_col.find_one({"code": req.code.upper()})
    if existing:
        raise HTTPException(status_code=409, detail="Coupon code already exists")

    doc = {
        "code": req.code.upper(),
        "type": req.type,
        "value": req.value,
        "minBookingAmount": req.minBookingAmount,
        "maxDiscount": req.maxDiscount,
        "expiresAt": req.expiresAt,
        "usageLimit": req.usageLimit,
        "usedCount": 0,
        "perUserLimit": req.perUserLimit,
        "description": req.description,
        "forFirstTimeOnly": req.forFirstTimeOnly,
        "isActive": True,
        "createdBy": user["_id"],
        "createdAt": utcnow(),
        "userUsage": {},  # Track per-user usage
    }
    result = await coupons_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    await log_audit(user["_id"], "coupon_create", "coupon", str(result.inserted_id))
    return coupon_to_out(doc)


@router.get("")
async def list_coupons(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    active_only: bool = True,
    user: dict = Depends(require_role("admin")),
):
    """Admin: List all coupons."""
    filter_q = {}
    if active_only:
        filter_q["isActive"] = True

    skip = (page - 1) * limit
    total = await coupons_col.count_documents(filter_q)
    cursor = coupons_col.find(filter_q, {"userUsage": 0}).sort("createdAt", -1).skip(skip).limit(limit)
    coupons = []
    async for c in cursor:
        coupons.append(coupon_to_out(c))
    return {"items": coupons, "total": total, "page": page}


@router.post("/validate")
async def validate_coupon(
    req: CouponValidateRequest,
    user: dict = Depends(get_current_user),
):
    """Validate a coupon code and return discount amount."""
    coupon = await coupons_col.find_one({"code": req.code.upper(), "isActive": True})
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid or inactive coupon code")

    # Check expiry
    if coupon.get("expiresAt"):
        exp = coupon["expiresAt"]
        if isinstance(exp, datetime) and exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if utcnow() > exp:
            raise HTTPException(status_code=400, detail="Coupon has expired")

    # Check usage limit
    if coupon.get("usedCount", 0) >= coupon.get("usageLimit", 0):
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")

    # Check per-user limit
    user_usage = coupon.get("userUsage", {}).get(str(user["_id"]), 0)
    if user_usage >= coupon.get("perUserLimit", 1):
        raise HTTPException(status_code=400, detail="You have already used this coupon")

    # Check first-time-only
    if coupon.get("forFirstTimeOnly"):
        # Check if user has any completed bookings
        existing_bookings = await bookings_col.count_documents({
            "userId": user["_id"],
            "status": {"$in": ["confirmed", "active", "completed"]},
        })
        if existing_bookings > 0:
            raise HTTPException(status_code=400, detail="This coupon is for first-time users only")

    # Check minimum booking amount
    if req.bookingAmount < coupon.get("minBookingAmount", 0):
        raise HTTPException(
            status_code=400,
            detail=f"Minimum booking amount ₹{coupon['minBookingAmount']} required",
        )

    discount = apply_coupon_discount(coupon, req.bookingAmount)

    return {
        "valid": True,
        "code": coupon["code"],
        "type": coupon["type"],
        "value": coupon["value"],
        "discount": discount,
        "description": coupon.get("description", ""),
    }


@router.put("/{coupon_id}/toggle")
async def toggle_coupon(
    coupon_id: str,
    user: dict = Depends(require_role("admin")),
):
    """Admin: Activate or deactivate a coupon."""
    if not ObjectId.is_valid(coupon_id):
        raise HTTPException(status_code=400, detail="Invalid coupon ID")
    coupon = await coupons_col.find_one({"_id": ObjectId(coupon_id)})
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    new_status = not coupon.get("isActive", True)
    await coupons_col.update_one(
        {"_id": ObjectId(coupon_id)},
        {"$set": {"isActive": new_status, "updatedAt": utcnow()}},
    )
    await log_audit(user["_id"], "coupon_toggle", "coupon", coupon_id, {"active": new_status})
    return {"isActive": new_status}


@router.delete("/{coupon_id}")
async def delete_coupon(
    coupon_id: str,
    user: dict = Depends(require_role("admin")),
):
    """Admin: Delete a coupon."""
    if not ObjectId.is_valid(coupon_id):
        raise HTTPException(status_code=400, detail="Invalid coupon ID")
    await coupons_col.delete_one({"_id": ObjectId(coupon_id)})
    await log_audit(user["_id"], "coupon_delete", "coupon", coupon_id)
    return {"message": "Coupon deleted"}
