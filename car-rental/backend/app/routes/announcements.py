"""System announcements — broadcast messages to all users."""
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from app.auth import get_current_user, require_role
from app.database import announcements_col, notifications_col, users_col
from app.models import AnnouncementCreateRequest, utcnow
from app.audit import log_audit

router = APIRouter(prefix="/api/announcements", tags=["announcements"])


def ann_to_out(a: dict) -> dict:
    a["_id"] = str(a["_id"])
    return a


@router.post("", status_code=201)
async def create_announcement(
    req: AnnouncementCreateRequest,
    broadcast: bool = True,
    user: dict = Depends(require_role("admin")),
):
    """Admin: Create and optionally broadcast a system announcement."""
    now = utcnow()
    doc = {
        "title": req.title,
        "message": req.message,
        "targetRole": req.targetRole,
        "link": req.link,
        "expiresAt": req.expiresAt,
        "createdBy": user["_id"],
        "createdAt": now,
    }
    result = await announcements_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    ann_id = str(result.inserted_id)

    # Broadcast as in-app notifications
    if broadcast:
        filter_q = {}
        if req.targetRole:
            filter_q["role"] = req.targetRole

        cursor = users_col.find(filter_q, {"_id": 1})
        notifications = []
        async for u in cursor:
            notifications.append({
                "userId": str(u["_id"]),
                "message": f"[{req.title}] {req.message}",
                "type": "info",
                "read": False,
                "link": req.link,
                "announcementId": ann_id,
                "createdAt": now,
            })
        if notifications:
            await notifications_col.insert_many(notifications)

    await log_audit(user["_id"], "announcement_create", "announcement", ann_id, {"broadcast": broadcast})
    return ann_to_out(doc)


@router.get("")
async def list_announcements(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_current_user),
):
    """List active announcements (for current user role or all)."""
    now = utcnow()
    filter_q = {
        "$or": [
            {"expiresAt": None},
            {"expiresAt": {"$gt": now}},
        ],
        "$or": [
            {"targetRole": None},
            {"targetRole": user["role"]},
        ],
    }

    skip = (page - 1) * limit
    total = await announcements_col.count_documents({})
    cursor = announcements_col.find({}).sort("createdAt", -1).skip(skip).limit(limit)
    items = []
    async for a in cursor:
        items.append(ann_to_out(a))

    return {"items": items, "total": total, "page": page}


@router.delete("/{announcement_id}")
async def delete_announcement(
    announcement_id: str,
    user: dict = Depends(require_role("admin")),
):
    """Admin: Delete an announcement."""
    if not ObjectId.is_valid(announcement_id):
        raise HTTPException(status_code=400, detail="Invalid announcement ID")
    await announcements_col.delete_one({"_id": ObjectId(announcement_id)})
    await log_audit(user["_id"], "announcement_delete", "announcement", announcement_id)
    return {"message": "Announcement deleted"}
