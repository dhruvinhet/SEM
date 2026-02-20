"""
Background tasks for the Car Rental application.
- Hold TTL expiry: cancel bookings where holdExpiresAt has passed
- Status transitions: move confirmed → active when start date reached
- Archive old completed/cancelled bookings
"""
import asyncio
from datetime import datetime, timezone
from app.database import bookings_col, notifications_col
from app.audit import log_audit


async def expire_holds():
    """Cancel bookings where hold has expired."""
    now = datetime.now(timezone.utc)
    cursor = bookings_col.find({
        "status": "held",
        "holdExpiresAt": {"$lte": now},
    })

    count = 0
    async for booking in cursor:
        await bookings_col.update_one(
            {"_id": booking["_id"], "status": "held"},
            {"$set": {"status": "cancelled", "cancelReason": "Hold expired", "updatedAt": now}},
        )
        await log_audit("system", "hold_expired", "booking", str(booking["_id"]))
        await notifications_col.insert_one({
            "userId": str(booking["userId"]),
            "message": "Your booking hold has expired and was cancelled.",
            "type": "warning",
            "read": False,
            "createdAt": now,
        })
        count += 1

    return count


async def activate_bookings():
    """Transition confirmed bookings to active when start date is reached."""
    now = datetime.now(timezone.utc)
    result = await bookings_col.update_many(
        {
            "status": "confirmed",
            "startDate": {"$lte": now},
        },
        {"$set": {"status": "active", "updatedAt": now}},
    )
    return result.modified_count


async def complete_bookings():
    """Transition active bookings to completed when end date is reached."""
    now = datetime.now(timezone.utc)
    result = await bookings_col.update_many(
        {
            "status": "active",
            "endDate": {"$lte": now},
        },
        {"$set": {"status": "completed", "updatedAt": now}},
    )
    return result.modified_count


async def archive_old_bookings(days_old: int = 90):
    """Archive old completed/cancelled bookings."""
    from datetime import timedelta
    cutoff = datetime.now(timezone.utc) - timedelta(days=days_old)
    result = await bookings_col.update_many(
        {
            "status": {"$in": ["completed", "cancelled", "refunded"]},
            "updatedAt": {"$lte": cutoff},
        },
        {"$set": {"status": "archived"}},
    )
    return result.modified_count


async def run_background_tasks():
    """Run all background tasks periodically."""
    while True:
        try:
            expired = await expire_holds()
            activated = await activate_bookings()
            completed = await complete_bookings()
            if expired or activated or completed:
                print(f"[Tasks] Expired: {expired}, Activated: {activated}, Completed: {completed}")
        except Exception as e:
            print(f"[Tasks] Error: {e}")

        await asyncio.sleep(60)  # Run every minute
