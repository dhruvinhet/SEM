from typing import Optional
from fastapi import APIRouter, Depends, Query
from bson import ObjectId
from app.auth import get_current_user
from app.database import notifications_col
from app.models import utcnow

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    user: dict = Depends(get_current_user),
):
    """Get paginated notifications for the current user."""
    filter_q = {"userId": user["_id"]}
    skip = (page - 1) * limit
    total = await notifications_col.count_documents(filter_q)
    unread = await notifications_col.count_documents({**filter_q, "read": False})

    cursor = notifications_col.find(filter_q).sort("createdAt", -1).skip(skip).limit(limit)
    notifications = []
    async for n in cursor:
        n["_id"] = str(n["_id"])
        notifications.append(n)

    return {
        "items": notifications,
        "notifications": notifications,
        "total": total,
        "unread": unread,
        "unreadCount": unread,
        "page": page,
    }


@router.post("/mark-read")
async def mark_read(
    ids: Optional[list] = None,
    user: dict = Depends(get_current_user),
):
    """Mark notifications as read. If no ids provided, mark all as read."""
    filter_q = {"userId": user["_id"]}
    if ids:
        filter_q["_id"] = {"$in": [ObjectId(i) for i in ids if ObjectId.is_valid(i)]}

    result = await notifications_col.update_many(filter_q, {"$set": {"read": True}})
    return {"modified": result.modified_count}
