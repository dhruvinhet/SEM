import os
import uuid
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Query
from bson import ObjectId
from app.auth import get_current_user, require_role
from app.database import vehicles_col, bookings_col
from app.models import (
    VehicleCreateRequest, VehicleUpdateRequest, VehicleOut,
    VehicleStatus, utcnow,
)
from app.audit import log_audit
from app.config import settings

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])


def vehicle_to_out(v: dict) -> dict:
    v["_id"] = str(v["_id"])
    v["ownerId"] = str(v["ownerId"])
    return v


@router.get("")
async def list_vehicles(
    query: Optional[str] = None,
    fuel: Optional[str] = None,
    transmission: Optional[str] = None,
    seats: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    location: Optional[str] = None,
    ownerId: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    sort: str = "createdAt",
):
    """Search vehicles with filters and pagination."""
    # If ownerId provided, show all statuses for that owner; otherwise only active
    if ownerId:
        # ownerId may be stored as ObjectId in DB, so query both forms
        oid = ObjectId(ownerId) if ObjectId.is_valid(ownerId) else None
        id_variants: list = [ownerId] + ([oid] if oid else [])
        filter_q: dict = {"ownerId": {"$in": id_variants}}
    else:
        filter_q: dict = {"status": "active"}

    if query:
        filter_q["$text"] = {"$search": query}
    if fuel:
        filter_q["specs.fuel"] = fuel
    if transmission:
        filter_q["specs.transmission"] = transmission
    if seats:
        filter_q["specs.seats"] = {"$gte": seats}
    if min_price is not None:
        filter_q.setdefault("pricing.baseRate", {})["$gte"] = min_price
    if max_price is not None:
        filter_q.setdefault("pricing.baseRate", {})["$lte"] = max_price
    if location:
        filter_q["location"] = {"$regex": location, "$options": "i"}

    # Sort mapping
    sort_field = "createdAt"
    sort_dir = -1
    if sort == "price_asc":
        sort_field = "pricing.baseRate"
        sort_dir = 1
    elif sort == "price_desc":
        sort_field = "pricing.baseRate"
        sort_dir = -1

    skip = (page - 1) * limit
    total = await vehicles_col.count_documents(filter_q)
    cursor = vehicles_col.find(filter_q).sort(sort_field, sort_dir).skip(skip).limit(limit)
    vehicles = []
    async for v in cursor:
        vehicles.append(vehicle_to_out(v))

    return {
        "items": vehicles,
        "total": total,
        "page": page,
        "pages": max((total + limit - 1) // limit, 1),
    }


@router.get("/{vehicle_id}")
async def get_vehicle(vehicle_id: str):
    """Get vehicle details with availability info."""
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    vehicle = await vehicles_col.find_one({"_id": ObjectId(vehicle_id)})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Fetch existing bookings for this vehicle to show booked ranges
    active_statuses = ["confirmed", "active", "held"]
    booked_cursor = bookings_col.find({
        "vehicleId": vehicle_id,
        "status": {"$in": active_statuses},
    }, {"startDate": 1, "endDate": 1, "status": 1})
    booked_ranges = []
    async for b in booked_cursor:
        booked_ranges.append({
            "start": b["startDate"],
            "end": b["endDate"],
            "status": b["status"],
        })

    out = vehicle_to_out(vehicle)
    out["bookedRanges"] = booked_ranges
    return out


@router.post("", status_code=201)
async def create_vehicle(
    req: VehicleCreateRequest,
    user: dict = Depends(require_role("owner", "admin")),
):
    """Create a new vehicle listing (owner only)."""
    doc = {
        "ownerId": ObjectId(user["_id"]),
        "title": req.title,
        "description": req.description,
        "images": [],
        "specs": req.specs.model_dump(),
        "pricing": req.pricing.model_dump(),
        "status": "active",
        "location": req.location or "",
        "approvalMode": req.approvalMode,
        "availability": [a.model_dump() for a in req.availability],
        "createdAt": utcnow(),
    }
    result = await vehicles_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    await log_audit(user["_id"], "vehicle_create", "vehicle", str(result.inserted_id))
    return vehicle_to_out(doc)


@router.put("/{vehicle_id}")
async def update_vehicle(
    vehicle_id: str,
    req: VehicleUpdateRequest,
    user: dict = Depends(require_role("owner", "admin")),
):
    """Update a vehicle listing."""
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    vehicle = await vehicles_col.find_one({"_id": ObjectId(vehicle_id)})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if str(vehicle["ownerId"]) != user["_id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not your vehicle")

    update_data = {}
    for field, value in req.model_dump(exclude_none=True).items():
        if field == "specs" and value:
            update_data["specs"] = value
        elif field == "pricing" and value:
            update_data["pricing"] = value
        elif field == "availability" and value is not None:
            update_data["availability"] = [a if isinstance(a, dict) else a for a in value]
        else:
            update_data[field] = value

    if update_data:
        update_data["updatedAt"] = utcnow()
        await vehicles_col.update_one({"_id": ObjectId(vehicle_id)}, {"$set": update_data})

    await log_audit(user["_id"], "vehicle_update", "vehicle", vehicle_id)
    updated = await vehicles_col.find_one({"_id": ObjectId(vehicle_id)})
    return vehicle_to_out(updated)


@router.delete("/{vehicle_id}")
async def delete_vehicle(
    vehicle_id: str,
    user: dict = Depends(require_role("owner", "admin")),
):
    """Delete a vehicle (soft-remove). Rejects if future bookings exist unless admin."""
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    vehicle = await vehicles_col.find_one({"_id": ObjectId(vehicle_id)})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if str(vehicle["ownerId"]) != user["_id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not your vehicle")

    # Check for future bookings
    future_bookings = await bookings_col.count_documents({
        "vehicleId": vehicle_id,
        "status": {"$in": ["confirmed", "active", "held"]},
        "endDate": {"$gte": utcnow()},
    })
    if future_bookings > 0 and user["role"] != "admin":
        raise HTTPException(
            status_code=409,
            detail=f"Cannot delete: {future_bookings} active/future bookings exist",
        )

    await vehicles_col.update_one(
        {"_id": ObjectId(vehicle_id)},
        {"$set": {"status": "removed", "updatedAt": utcnow()}},
    )
    await log_audit(user["_id"], "vehicle_delete", "vehicle", vehicle_id)
    return {"message": "Vehicle removed"}


@router.post("/{vehicle_id}/images", status_code=201)
async def upload_images(
    vehicle_id: str,
    files: List[UploadFile] = File(...),
    user: dict = Depends(require_role("owner", "admin")),
):
    """Upload images for a vehicle."""
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    vehicle = await vehicles_col.find_one({"_id": ObjectId(vehicle_id)})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if str(vehicle["ownerId"]) != user["_id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not your vehicle")

    upload_dir = os.path.join(settings.UPLOAD_DIR, vehicle_id)
    os.makedirs(upload_dir, exist_ok=True)

    new_images = []
    existing_images = vehicle.get("images", [])
    for i, file in enumerate(files):
        if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
            raise HTTPException(status_code=400, detail=f"Invalid image type: {file.content_type}")

        ext = file.filename.split(".")[-1] if file.filename else "jpg"
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(upload_dir, filename)

        content = await file.read()
        if len(content) > settings.MAX_IMAGE_SIZE_MB * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"Image too large (max {settings.MAX_IMAGE_SIZE_MB}MB)")

        with open(filepath, "wb") as f:
            f.write(content)

        is_primary = len(existing_images) == 0 and i == 0
        new_images.append({
            "url": f"/uploads/{vehicle_id}/{filename}",
            "isPrimary": is_primary,
        })

    await vehicles_col.update_one(
        {"_id": ObjectId(vehicle_id)},
        {"$push": {"images": {"$each": new_images}}},
    )

    return {"images": new_images, "message": f"{len(new_images)} images uploaded"}
