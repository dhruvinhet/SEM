import math
import os
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from bson import ObjectId
from app.auth import get_current_user, require_role
from app.database import vehicles_col, bookings_col, recently_viewed_col
from app.models import (
    VehicleCreateRequest, VehicleUpdateRequest,
    utcnow,
)
from app.audit import log_audit
from app.config import settings

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])


def vehicle_to_out(v: dict) -> dict:
    v["_id"] = str(v["_id"])
    v["ownerId"] = str(v["ownerId"])
    return v


def haversine_distance(lat1, lng1, lat2, lng2):
    """Distance in km between two lat/lng points."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


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
    instant_booking: Optional[bool] = None,
    available_now: Optional[bool] = None,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    max_distance_km: Optional[float] = None,
    sort: str = "createdAt",
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
):
    """Search vehicles with all filters, geo-search, availability, sort."""
    if ownerId:
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
    if instant_booking is not None:
        filter_q["instantBooking"] = instant_booking

    sort_field = "createdAt"
    sort_dir = -1
    if sort == "price_asc":
        sort_field, sort_dir = "pricing.baseRate", 1
    elif sort == "price_desc":
        sort_field, sort_dir = "pricing.baseRate", -1
    elif sort in ("rating", "best_rated"):
        sort_field, sort_dir = "avgRating", -1
    elif sort in ("popular", "most_popular"):
        sort_field, sort_dir = "totalBookings", -1

    skip = (page - 1) * limit
    total = await vehicles_col.count_documents(filter_q)
    cursor = vehicles_col.find(filter_q).sort(sort_field, sort_dir).skip(skip).limit(limit)
    vehicles = []
    async for v in cursor:
        out = vehicle_to_out(v)
        # Geo-filter / distance annotation
        if user_lat is not None and user_lng is not None:
            vlat = v.get("geoLocation", {}).get("lat")
            vlng = v.get("geoLocation", {}).get("lng")
            if vlat is not None and vlng is not None:
                dist = haversine_distance(user_lat, user_lng, vlat, vlng)
                out["distanceKm"] = round(dist, 2)
                if max_distance_km is not None and dist > max_distance_km:
                    continue
            else:
                out["distanceKm"] = None
        vehicles.append(out)

    if sort == "distance" and user_lat is not None and user_lng is not None:
        vehicles.sort(key=lambda v: v.get("distanceKm") or float("inf"))

    # available_now filter: exclude vehicles with active booking today
    if available_now:
        now = utcnow()
        available = []
        for v in vehicles:
            active_booking = await bookings_col.find_one({
                "vehicleId": v["_id"],
                "status": {"$in": ["confirmed", "active", "held"]},
                "startDate": {"$lte": now},
                "endDate": {"$gte": now},
            })
            if not active_booking:
                available.append(v)
        vehicles = available
        total = len(vehicles)

    # Date-range availability filter
    if start_date and end_date:
        start_dt = datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc)
        end_dt = datetime.fromisoformat(end_date).replace(tzinfo=timezone.utc)
        filtered = []
        for v in vehicles:
            overlap = await bookings_col.find_one({
                "vehicleId": v["_id"],
                "status": {"$in": ["confirmed", "active", "held"]},
                "startDate": {"$lt": end_dt},
                "endDate": {"$gt": start_dt},
            })
            if not overlap:
                filtered.append(v)
        vehicles = filtered
        total = len(vehicles)

    return {
        "items": vehicles,
        "total": total,
        "page": page,
        "pages": max((total + limit - 1) // limit, 1),
    }


@router.get("/{vehicle_id}")
async def get_vehicle(vehicle_id: str, user: dict = Depends(get_current_user)):
    """Get vehicle details with booked ranges. Tracks recently viewed."""
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    vehicle = await vehicles_col.find_one({"_id": ObjectId(vehicle_id)})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    active_statuses = ["confirmed", "active", "held"]
    booked_cursor = bookings_col.find({"vehicleId": vehicle_id, "status": {"$in": active_statuses}}, {"startDate": 1, "endDate": 1, "status": 1})
    booked_ranges = []
    async for b in booked_cursor:
        booked_ranges.append({"start": b["startDate"], "end": b["endDate"], "status": b["status"]})

    out = vehicle_to_out(vehicle)
    out["bookedRanges"] = booked_ranges

    # Track recently viewed (non-blocking)
    if user:
        try:
            now = utcnow()
            await recently_viewed_col.update_one(
                {"userId": user["_id"], "vehicleId": vehicle_id},
                {"$set": {"userId": user["_id"], "vehicleId": vehicle_id, "viewedAt": now}},
                upsert=True,
            )
        except Exception:
            pass

    return out


@router.post("", status_code=201)
async def create_vehicle(req: VehicleCreateRequest, user: dict = Depends(require_role("owner", "admin"))):
    """Create a new vehicle listing."""
    doc = {
        "ownerId": ObjectId(user["_id"]),
        "title": req.title,
        "description": req.description,
        "images": [],
        "specs": req.specs.model_dump(),
        "pricing": req.pricing.model_dump(),
        "status": "active",
        "location": req.location or "",
        "geoLocation": req.geoLocation.model_dump() if req.geoLocation else None,
        "approvalMode": req.approvalMode,
        "instantBooking": req.instantBooking,
        "cancellationPolicy": req.cancellationPolicy,
        "peakSeasonRanges": [p.model_dump() for p in req.peakSeasonRanges] if req.peakSeasonRanges else [],
        "availability": [a.model_dump() for a in req.availability],
        "avgRating": 0.0,
        "totalRatings": 0,
        "totalBookings": 0,
        "ownerVerified": False,
        "insuranceVerified": False,
        "createdAt": utcnow(),
        "updatedAt": utcnow(),
    }
    result = await vehicles_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    await log_audit(user["_id"], "vehicle_create", "vehicle", str(result.inserted_id))
    return vehicle_to_out(doc)


@router.put("/{vehicle_id}")
async def update_vehicle(vehicle_id: str, req: VehicleUpdateRequest, user: dict = Depends(require_role("owner", "admin"))):
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
            update_data["availability"] = value
        elif field == "geoLocation" and value:
            update_data["geoLocation"] = value
        elif field == "peakSeasonRanges" and value is not None:
            update_data["peakSeasonRanges"] = value
        else:
            update_data[field] = value

    if update_data:
        update_data["updatedAt"] = utcnow()
        await vehicles_col.update_one({"_id": ObjectId(vehicle_id)}, {"$set": update_data})

    await log_audit(user["_id"], "vehicle_update", "vehicle", vehicle_id)
    updated = await vehicles_col.find_one({"_id": ObjectId(vehicle_id)})
    return vehicle_to_out(updated)


@router.delete("/{vehicle_id}")
async def delete_vehicle(vehicle_id: str, user: dict = Depends(require_role("owner", "admin"))):
    """Soft-delete a vehicle."""
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    vehicle = await vehicles_col.find_one({"_id": ObjectId(vehicle_id)})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if str(vehicle["ownerId"]) != user["_id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not your vehicle")

    future_bookings = await bookings_col.count_documents({"vehicleId": vehicle_id, "status": {"$in": ["confirmed", "active", "held"]}, "endDate": {"$gte": utcnow()}})
    if future_bookings > 0 and user["role"] != "admin":
        raise HTTPException(status_code=409, detail=f"Cannot delete: {future_bookings} active/future bookings exist")

    await vehicles_col.update_one({"_id": ObjectId(vehicle_id)}, {"$set": {"status": "removed", "updatedAt": utcnow()}})
    await log_audit(user["_id"], "vehicle_delete", "vehicle", vehicle_id)
    return {"message": "Vehicle removed"}


@router.post("/{vehicle_id}/images", status_code=201)
async def upload_images(vehicle_id: str, files: List[UploadFile] = File(...), user: dict = Depends(require_role("owner", "admin"))):
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
        new_images.append({"url": f"/uploads/{vehicle_id}/{filename}", "isPrimary": len(existing_images) == 0 and i == 0})

    await vehicles_col.update_one({"_id": ObjectId(vehicle_id)}, {"$push": {"images": {"$each": new_images}}})
    return {"images": new_images, "message": f"{len(new_images)} images uploaded"}
