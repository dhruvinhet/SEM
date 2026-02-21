"""Saved searches and recently viewed vehicles."""
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from app.auth import get_current_user
from app.database import saved_searches_col, recently_viewed_col, vehicles_col
from app.models import SavedSearchRequest, utcnow

router = APIRouter(prefix="/api/search", tags=["search"])


@router.post("/saved", status_code=201)
async def save_search(
    req: SavedSearchRequest,
    user: dict = Depends(get_current_user),
):
    """Save a search query for later."""
    # Limit to 10 saved searches per user
    count = await saved_searches_col.count_documents({"userId": user["_id"]})
    if count >= 10:
        # Remove oldest
        oldest = await saved_searches_col.find_one(
            {"userId": user["_id"]}, sort=[("createdAt", 1)]
        )
        if oldest:
            await saved_searches_col.delete_one({"_id": oldest["_id"]})

    doc = {
        "userId": user["_id"],
        "name": req.name,
        "filters": req.filters,
        "createdAt": utcnow(),
    }
    result = await saved_searches_col.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


@router.get("/saved")
async def list_saved_searches(user: dict = Depends(get_current_user)):
    """Get user's saved searches."""
    cursor = saved_searches_col.find({"userId": user["_id"]}).sort("createdAt", -1)
    items = []
    async for s in cursor:
        s["_id"] = str(s["_id"])
        items.append(s)
    return {"items": items}


@router.delete("/saved/{search_id}")
async def delete_saved_search(search_id: str, user: dict = Depends(get_current_user)):
    """Delete a saved search."""
    if not ObjectId.is_valid(search_id):
        raise HTTPException(status_code=400, detail="Invalid search ID")
    await saved_searches_col.delete_one({"_id": ObjectId(search_id), "userId": user["_id"]})
    return {"message": "Saved search deleted"}


@router.post("/recently-viewed/{vehicle_id}", status_code=201)
async def track_recently_viewed(
    vehicle_id: str,
    user: dict = Depends(get_current_user),
):
    """Track a recently viewed vehicle."""
    now = utcnow()
    # Upsert: update timestamp if already viewed, else insert
    await recently_viewed_col.update_one(
        {"userId": user["_id"], "vehicleId": vehicle_id},
        {"$set": {"viewedAt": now}},
        upsert=True,
    )
    return {"tracked": True}


@router.get("/recently-viewed")
async def get_recently_viewed(
    limit: int = Query(10, ge=1, le=20),
    user: dict = Depends(get_current_user),
):
    """Get recently viewed vehicles for the current user."""
    # Get recently viewed vehicle IDs, sorted by most recent
    cursor = recently_viewed_col.find(
        {"userId": user["_id"]}
    ).sort("viewedAt", -1).limit(limit)

    vehicle_ids = []
    async for rv in cursor:
        vehicle_ids.append(rv["vehicleId"])

    # Fetch vehicle details
    vehicles = []
    for vid in vehicle_ids:
        if ObjectId.is_valid(vid):
            v = await vehicles_col.find_one({"_id": ObjectId(vid), "status": "active"})
            if v:
                v["_id"] = str(v["_id"])
                v["ownerId"] = str(v["ownerId"])
                vehicles.append(v)

    return {"items": vehicles}
