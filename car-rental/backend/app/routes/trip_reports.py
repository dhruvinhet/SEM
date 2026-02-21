"""Pre & Post Trip Workflow — checklists, damage reports, odometer, fuel."""
import os
import uuid
from typing import List
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from bson import ObjectId
from app.auth import get_current_user
from app.database import bookings_col, trip_reports_col, vehicles_col
from app.models import TripReportCreateRequest, utcnow
from app.audit import log_audit
from app.config import settings

router = APIRouter(prefix="/api/trip-reports", tags=["trip-reports"])

PRE_TRIP_CHECKLIST = [
    "Engine oil level OK",
    "Tire pressure checked",
    "Fuel level noted",
    "Odometer reading captured",
    "No visible exterior damage",
    "Headlights & taillights functional",
    "Brakes responsive",
    "AC/Heater functional",
    "All documents present (RC, insurance)",
    "Interior clean & undamaged",
]

POST_TRIP_CHECKLIST = [
    "Fuel level confirmed",
    "Odometer reading captured",
    "No new exterior damage",
    "Interior returned in clean condition",
    "All personal items removed",
    "Keys returned",
    "Parking in designated spot",
]


def report_to_out(r: dict) -> dict:
    r["_id"] = str(r["_id"])
    return r


@router.get("/checklist/{report_type}")
async def get_checklist_template(
    report_type: str,
    user: dict = Depends(get_current_user),
):
    """Get pre or post trip checklist template."""
    if report_type == "pre_trip":
        items = [{"label": item, "checked": False} for item in PRE_TRIP_CHECKLIST]
    elif report_type == "post_trip":
        items = [{"label": item, "checked": False} for item in POST_TRIP_CHECKLIST]
    else:
        raise HTTPException(status_code=400, detail="Invalid report type")
    return {"reportType": report_type, "checklist": items}


@router.post("", status_code=201)
async def create_trip_report(
    req: TripReportCreateRequest,
    user: dict = Depends(get_current_user),
):
    """Create a pre or post trip report for a booking."""
    if not ObjectId.is_valid(req.bookingId):
        raise HTTPException(status_code=400, detail="Invalid booking ID")

    booking = await bookings_col.find_one({"_id": ObjectId(req.bookingId)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    b_user = str(booking.get("userId", ""))
    b_owner = str(booking.get("ownerId", ""))
    if user["_id"] not in (b_user, b_owner) and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    # Check for duplicate report of same type
    existing = await trip_reports_col.find_one({
        "bookingId": req.bookingId,
        "reportType": req.reportType,
    })
    if existing:
        raise HTTPException(status_code=409, detail=f"A {req.reportType} report already exists for this booking")

    # Validate status transitions
    if req.reportType == "pre_trip" and booking["status"] not in ("confirmed", "active"):
        raise HTTPException(status_code=400, detail="Pre-trip report can only be created for confirmed/active bookings")
    if req.reportType == "post_trip" and booking["status"] not in ("active", "completed"):
        raise HTTPException(status_code=400, detail="Post-trip report can only be created for active/completed bookings")

    doc = {
        "bookingId": req.bookingId,
        "reportedBy": user["_id"],
        "reportType": req.reportType,
        "checklist": [item.model_dump() for item in req.checklist],
        "odometerReading": req.odometerReading,
        "fuelLevel": req.fuelLevel,
        "photos": [],
        "notes": req.notes,
        "damageDescription": req.damageDescription,
        "extraCharges": req.extraCharges,
        "extraChargesReason": req.extraChargesReason,
        "createdAt": utcnow(),
    }

    result = await trip_reports_col.insert_one(doc)
    doc["_id"] = result.inserted_id

    # Link the report to the booking
    report_field = "tripStartReportId" if req.reportType == "pre_trip" else "tripEndReportId"
    update_data = {report_field: str(result.inserted_id), "updatedAt": utcnow()}

    # If post-trip and has extra charges, add them to the booking
    if req.reportType == "post_trip" and req.extraCharges > 0:
        update_data["extraCharges"] = req.extraCharges
        update_data["extraChargesReason"] = req.extraChargesReason

    await bookings_col.update_one(
        {"_id": ObjectId(req.bookingId)},
        {"$set": update_data},
    )

    await log_audit(user["_id"], f"trip_report_{req.reportType}", "booking", req.bookingId)
    return report_to_out(doc)


@router.post("/{report_id}/photos", status_code=201)
async def upload_report_photos(
    report_id: str,
    files: List[UploadFile] = File(...),
    user: dict = Depends(get_current_user),
):
    """Upload condition photos for a trip report."""
    if not ObjectId.is_valid(report_id):
        raise HTTPException(status_code=400, detail="Invalid report ID")

    report = await trip_reports_col.find_one({"_id": ObjectId(report_id)})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report["reportedBy"] != user["_id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    upload_dir = os.path.join(settings.UPLOAD_DIR, "trip_reports", report_id)
    os.makedirs(upload_dir, exist_ok=True)

    new_photos = []
    for file in files:
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

        new_photos.append(f"/uploads/trip_reports/{report_id}/{filename}")

    await trip_reports_col.update_one(
        {"_id": ObjectId(report_id)},
        {"$push": {"photos": {"$each": new_photos}}},
    )

    return {"photos": new_photos, "count": len(new_photos)}


@router.get("/booking/{booking_id}")
async def get_reports_for_booking(
    booking_id: str,
    user: dict = Depends(get_current_user),
):
    """Get all trip reports for a booking."""
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")

    booking = await bookings_col.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    b_user = str(booking.get("userId", ""))
    b_owner = str(booking.get("ownerId", ""))
    if user["_id"] not in (b_user, b_owner) and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    cursor = trip_reports_col.find({"bookingId": booking_id}).sort("createdAt", 1)
    reports = []
    async for r in cursor:
        reports.append(report_to_out(r))

    return {"reports": reports, "count": len(reports)}


@router.get("/{report_id}")
async def get_report(
    report_id: str,
    user: dict = Depends(get_current_user),
):
    """Get a single trip report."""
    if not ObjectId.is_valid(report_id):
        raise HTTPException(status_code=400, detail="Invalid report ID")
    report = await trip_reports_col.find_one({"_id": ObjectId(report_id)})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report_to_out(report)
