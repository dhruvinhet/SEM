"""Trust & Safety — identity verification, insurance, owner verification."""
import os
import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from bson import ObjectId
from app.auth import get_current_user, require_role
from app.database import verifications_col, users_col, vehicles_col
from app.models import VerificationCreateRequest, utcnow
from app.audit import log_audit
from app.config import settings

router = APIRouter(prefix="/api/verifications", tags=["verifications"])


def ver_to_out(v: dict) -> dict:
    v["_id"] = str(v["_id"])
    return v


@router.post("", status_code=201)
async def submit_verification(
    req: VerificationCreateRequest,
    vehicle_id: Optional[str] = None,
    user: dict = Depends(get_current_user),
):
    """Submit a verification request (aadhaar, license, insurance, owner_badge)."""
    valid_types = ["aadhaar", "license", "insurance", "owner_badge"]
    if req.verificationType not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid type. Must be one of: {valid_types}")

    # Check for existing pending/submitted verification of same type
    existing = await verifications_col.find_one({
        "userId": user["_id"],
        "verificationType": req.verificationType,
        "status": {"$in": ["pending", "submitted"]},
    })
    if existing:
        raise HTTPException(status_code=409, detail=f"A {req.verificationType} verification is already pending")

    doc = {
        "userId": user["_id"],
        "vehicleId": vehicle_id,
        "verificationType": req.verificationType,
        "documentNumber": req.documentNumber,
        "status": "pending",
        "documentUrls": [],
        "notes": req.notes,
        "adminNotes": None,
        "reviewedBy": None,
        "createdAt": utcnow(),
    }
    result = await verifications_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    await log_audit(user["_id"], "verification_submit", "verification", str(result.inserted_id))
    return ver_to_out(doc)


@router.post("/{verification_id}/documents", status_code=201)
async def upload_verification_documents(
    verification_id: str,
    files: list[UploadFile] = File(...),
    user: dict = Depends(get_current_user),
):
    """Upload supporting documents for a verification."""
    if not ObjectId.is_valid(verification_id):
        raise HTTPException(status_code=400, detail="Invalid verification ID")

    verif = await verifications_col.find_one({"_id": ObjectId(verification_id)})
    if not verif:
        raise HTTPException(status_code=404, detail="Verification not found")

    if verif["userId"] != user["_id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    upload_dir = os.path.join(settings.UPLOAD_DIR, "verifications", verification_id)
    os.makedirs(upload_dir, exist_ok=True)

    new_urls = []
    for file in files:
        if file.content_type not in ("image/jpeg", "image/png", "image/webp", "application/pdf"):
            raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}")

        ext = (file.filename or "document").split(".")[-1]
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(upload_dir, filename)
        content = await file.read()

        if len(content) > settings.MAX_IMAGE_SIZE_MB * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large")

        with open(filepath, "wb") as f:
            f.write(content)

        new_urls.append(f"/uploads/verifications/{verification_id}/{filename}")

    await verifications_col.update_one(
        {"_id": ObjectId(verification_id)},
        {"$push": {"documentUrls": {"$each": new_urls}}, "$set": {"status": "submitted", "updatedAt": utcnow()}},
    )

    return {"urls": new_urls, "status": "submitted"}


@router.get("/my")
async def get_my_verifications(user: dict = Depends(get_current_user)):
    """Get all verifications for the current user."""
    cursor = verifications_col.find({"userId": user["_id"]}).sort("createdAt", -1)
    items = []
    async for v in cursor:
        items.append(ver_to_out(v))
    return {"items": items}


@router.get("")
async def list_verifications(
    status: Optional[str] = None,
    verification_type: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: dict = Depends(require_role("admin")),
):
    """Admin: List all verification requests."""
    filter_q = {}
    if status:
        filter_q["status"] = status
    if verification_type:
        filter_q["verificationType"] = verification_type

    skip = (page - 1) * limit
    total = await verifications_col.count_documents(filter_q)
    cursor = verifications_col.find(filter_q).sort("createdAt", -1).skip(skip).limit(limit)
    items = []
    async for v in cursor:
        items.append(ver_to_out(v))

    return {"items": items, "total": total, "page": page}


@router.post("/{verification_id}/review")
async def review_verification(
    verification_id: str,
    decision: str,  # "approved" | "rejected"
    admin_notes: Optional[str] = None,
    user: dict = Depends(require_role("admin")),
):
    """Admin: Approve or reject a verification."""
    if not ObjectId.is_valid(verification_id):
        raise HTTPException(status_code=400, detail="Invalid verification ID")
    if decision not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Decision must be 'approved' or 'rejected'")

    verif = await verifications_col.find_one({"_id": ObjectId(verification_id)})
    if not verif:
        raise HTTPException(status_code=404, detail="Verification not found")

    now = utcnow()
    await verifications_col.update_one(
        {"_id": ObjectId(verification_id)},
        {"$set": {
            "status": decision,
            "adminNotes": admin_notes,
            "reviewedBy": user["_id"],
            "reviewedAt": now,
            "updatedAt": now,
        }},
    )

    # If approved, update user/vehicle flags
    if decision == "approved":
        v_type = verif["verificationType"]
        if v_type in ("aadhaar", "license"):
            await users_col.update_one(
                {"_id": ObjectId(verif["userId"])},
                {"$set": {"isVerified": True, "updatedAt": now}},
            )
        elif v_type == "owner_badge":
            await users_col.update_one(
                {"_id": ObjectId(verif["userId"])},
                {"$set": {"ownerVerified": True, "updatedAt": now}},
            )
        elif v_type == "insurance" and verif.get("vehicleId"):
            if ObjectId.is_valid(verif["vehicleId"]):
                await vehicles_col.update_one(
                    {"_id": ObjectId(verif["vehicleId"])},
                    {"$set": {"insuranceVerified": True, "updatedAt": now}},
                )

    await log_audit(user["_id"], f"verification_{decision}", "verification", verification_id)
    return {"message": f"Verification {decision}", "status": decision}
