from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.auth import get_current_user
from app.database import reviews_col, bookings_col, vehicles_col
from app.models import ReviewCreateRequest, utcnow
from app.audit import log_audit

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.post("", status_code=201)
async def create_review(
    req: ReviewCreateRequest,
    user: dict = Depends(get_current_user),
):
    """Create a review for a completed booking."""
    if not ObjectId.is_valid(req.bookingId):
        raise HTTPException(status_code=400, detail="Invalid booking ID")

    booking = await bookings_col.find_one({"_id": ObjectId(req.bookingId)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if str(booking.get("userId", "")) != user["_id"]:
        raise HTTPException(status_code=403, detail="You can only review your own bookings")
    if booking["status"] not in ("completed", "archived"):
        raise HTTPException(status_code=400, detail="Can only review completed bookings")

    # Check for existing review
    existing = await reviews_col.find_one({"bookingId": req.bookingId, "userId": user["_id"]})
    if existing:
        raise HTTPException(status_code=409, detail="You already reviewed this booking")

    review_doc = {
        "bookingId": req.bookingId,
        "vehicleId": req.vehicleId,
        "userId": user["_id"],
        "rating": req.rating,
        "comment": req.comment,
        "createdAt": utcnow(),
    }

    result = await reviews_col.insert_one(review_doc)
    review_doc["_id"] = str(result.inserted_id)

    await log_audit(user["_id"], "review_create", "review", str(result.inserted_id))
    return review_doc


@router.get("/vehicle/{vehicle_id}")
async def get_vehicle_reviews(vehicle_id: str):
    """Get all reviews for a vehicle."""
    cursor = reviews_col.find({"vehicleId": vehicle_id}).sort("createdAt", -1)
    reviews = []
    async for r in cursor:
        r["_id"] = str(r["_id"])
        reviews.append(r)

    # Calculate average rating
    avg = sum(r["rating"] for r in reviews) / len(reviews) if reviews else 0
    return {"reviews": reviews, "averageRating": round(avg, 1), "count": len(reviews)}
