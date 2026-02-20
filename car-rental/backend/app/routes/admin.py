import csv
import io
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from bson import ObjectId
from app.auth import require_role
from app.database import (
    users_col, vehicles_col, bookings_col, payments_col,
    audit_logs_col, notifications_col,
)
from app.models import utcnow
from app.audit import log_audit

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/analytics")
async def get_analytics(
    range: str = Query("monthly", pattern="^(weekly|monthly|yearly)$"),
    user: dict = Depends(require_role("admin")),
):
    """Get aggregated analytics for admin dashboard."""
    now = utcnow()
    if range == "weekly":
        start = now - timedelta(days=7)
    elif range == "monthly":
        start = now - timedelta(days=30)
    else:
        start = now - timedelta(days=365)

    # Total counts
    total_users = await users_col.count_documents({})
    total_owners = await users_col.count_documents({"role": "owner"})
    total_vehicles = await vehicles_col.count_documents({"status": "active"})
    total_bookings = await bookings_col.count_documents({})

    # Period stats
    period_bookings = await bookings_col.count_documents({"createdAt": {"$gte": start}})
    period_cancelled = await bookings_col.count_documents({
        "status": "cancelled",
        "updatedAt": {"$gte": start},
    })
    period_completed = await bookings_col.count_documents({
        "status": {"$in": ["completed", "archived"]},
        "updatedAt": {"$gte": start},
    })

    # Revenue calculation
    revenue_pipeline = [
        {"$match": {"status": "succeeded", "createdAt": {"$gte": start}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]
    revenue_result = await payments_col.aggregate(revenue_pipeline).to_list(1)
    period_revenue = revenue_result[0]["total"] if revenue_result else 0

    # Monthly revenue trend (last 12 months)
    monthly_pipeline = [
        {"$match": {"status": "succeeded"}},
        {"$group": {
            "_id": {
                "year": {"$year": "$createdAt"},
                "month": {"$month": "$createdAt"},
            },
            "revenue": {"$sum": "$amount"},
            "count": {"$sum": 1},
        }},
        {"$sort": {"_id.year": 1, "_id.month": 1}},
        {"$limit": 12},
    ]
    monthly_trend = await payments_col.aggregate(monthly_pipeline).to_list(12)

    # Top vehicles by bookings
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
                top_vehicles.append({
                    "vehicleId": vid,
                    "title": v.get("title", "Unknown"),
                    "bookings": tv["count"],
                })

    # Booking status distribution
    status_pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
    ]
    status_dist = await bookings_col.aggregate(status_pipeline).to_list(20)

    conversion_rate = round(period_completed / period_bookings * 100, 1) if period_bookings > 0 else 0

    return {
        "summary": {
            "totalUsers": total_users,
            "totalOwners": total_owners,
            "totalVehicles": total_vehicles,
            "totalBookings": total_bookings,
        },
        "period": {
            "range": range,
            "bookings": period_bookings,
            "cancelled": period_cancelled,
            "completed": period_completed,
            "revenue": period_revenue,
            "conversionRate": conversion_rate,
        },
        "monthlyTrend": [
            {
                "month": f"{m['_id']['year']}-{str(m['_id']['month']).zfill(2)}",
                "revenue": m["revenue"],
                "count": m["count"],
            }
            for m in monthly_trend
        ],
        "topVehicles": top_vehicles,
        "statusDistribution": [{"status": s["_id"], "count": s["count"]} for s in status_dist],
    }


@router.get("/bookings")
async def admin_list_bookings(
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: dict = Depends(require_role("admin")),
):
    """Admin: list all bookings with filters."""
    filter_q = {}
    if status:
        filter_q["status"] = status
    if start_date:
        filter_q["startDate"] = {"$gte": datetime.fromisoformat(start_date)}
    if end_date:
        filter_q.setdefault("endDate", {})["$lte"] = datetime.fromisoformat(end_date)

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


@router.get("/bookings/export")
async def export_bookings_csv(
    status: Optional[str] = None,
    user: dict = Depends(require_role("admin")),
):
    """Export bookings as CSV."""
    filter_q = {}
    if status:
        filter_q["status"] = status

    cursor = bookings_col.find(filter_q).sort("createdAt", -1)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "BookingID", "VehicleID", "UserID", "OwnerID",
        "StartDate", "EndDate", "Days", "Total", "Status", "CreatedAt",
    ])

    async for b in cursor:
        writer.writerow([
            str(b["_id"]),
            str(b.get("vehicleId", "")),
            str(b.get("userId", "")),
            str(b.get("ownerId", "")),
            b.get("startDate", ""),
            b.get("endDate", ""),
            b.get("days", 0),
            b.get("priceBreakdown", {}).get("total", 0),
            b.get("status", ""),
            b.get("createdAt", ""),
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=bookings_export.csv"},
    )


@router.get("/vehicles")
async def admin_list_vehicles(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: dict = Depends(require_role("admin")),
):
    """Admin: moderate vehicles."""
    filter_q = {}
    if status:
        filter_q["status"] = status

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
async def approve_vehicle(
    vehicle_id: str,
    user: dict = Depends(require_role("admin")),
):
    """Admin approves a vehicle listing."""
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")

    await vehicles_col.update_one(
        {"_id": ObjectId(vehicle_id)},
        {"$set": {"status": "active", "updatedAt": utcnow()}},
    )
    await log_audit(user["_id"], "vehicle_approve", "vehicle", vehicle_id)
    return {"message": "Vehicle approved"}


@router.post("/vehicles/{vehicle_id}/reject")
async def reject_vehicle(
    vehicle_id: str,
    reason: str = "",
    user: dict = Depends(require_role("admin")),
):
    """Admin rejects a vehicle listing."""
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")

    await vehicles_col.update_one(
        {"_id": ObjectId(vehicle_id)},
        {"$set": {"status": "removed", "rejectionReason": reason, "updatedAt": utcnow()}},
    )
    await log_audit(user["_id"], "vehicle_reject", "vehicle", vehicle_id, {"reason": reason})
    return {"message": "Vehicle rejected"}


@router.get("/audit-logs")
async def get_audit_logs(
    action: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    user: dict = Depends(require_role("admin")),
):
    """Get audit logs for admin review."""
    filter_q = {}
    if action:
        filter_q["action"] = action

    skip = (page - 1) * limit
    total = await audit_logs_col.count_documents(filter_q)
    cursor = audit_logs_col.find(filter_q).sort("createdAt", -1).skip(skip).limit(limit)
    logs = []
    async for log in cursor:
        log["_id"] = str(log["_id"])
        logs.append(log)

    return {"items": logs, "total": total, "page": page}


@router.get("/users")
async def admin_list_users(
    role: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: dict = Depends(require_role("admin")),
):
    """Admin: list all users."""
    filter_q = {}
    if role:
        filter_q["role"] = role

    skip = (page - 1) * limit
    total = await users_col.count_documents(filter_q)
    cursor = users_col.find(filter_q, {"passwordHash": 0}).sort("createdAt", -1).skip(skip).limit(limit)
    users_list = []
    async for u in cursor:
        u["_id"] = str(u["_id"])
        users_list.append(u)

    return {"items": users_list, "total": total, "page": page}
