import secrets
from fastapi import APIRouter, HTTPException, Depends
from app.models import SignupRequest, LoginRequest, TokenResponse, UpdateProfileRequest, utcnow
from app.auth import hash_password, verify_password, create_access_token, get_current_user
from app.database import users_col, referrals_col, config_col
from app.audit import log_audit
from bson import ObjectId

router = APIRouter(prefix="/api/auth", tags=["auth"])


def user_to_dict(user: dict) -> dict:
    return {
        "_id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "verified": user.get("verified", False),
        "isVerified": user.get("isVerified", False),
        "isBlacklisted": user.get("isBlacklisted", False),
        "referralCode": user.get("referralCode", ""),
        "referralCount": user.get("referralCount", 0),
        "emergencyContact": user.get("emergencyContact"),
        "createdAt": user.get("createdAt"),
        "profile": user.get("profile", {}),
    }


async def get_config_value(key: str, default):
    cfg = await config_col.find_one({"key": key})
    return cfg["value"] if cfg else default


@router.post("/signup", response_model=TokenResponse, status_code=201)
async def signup(req: SignupRequest):
    existing = await users_col.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    referral_doc = None
    if req.referralCode:
        referrer = await users_col.find_one({"referralCode": req.referralCode})
        if not referrer:
            raise HTTPException(status_code=400, detail="Invalid referral code")
        referral_doc = referrer

    my_code = secrets.token_urlsafe(8)
    now = utcnow()

    user_doc = {
        "name": req.name,
        "email": req.email,
        "passwordHash": hash_password(req.password),
        "role": req.role.value,
        "verified": False,
        "isVerified": False,
        "isBlacklisted": False,
        "referralCode": my_code,
        "referralCount": 0,
        "referredBy": req.referralCode if req.referralCode else None,
        "emergencyContact": None,
        "createdAt": now,
        "updatedAt": now,
        "profile": {},
    }
    result = await users_col.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    # Track referral and increment referrer count
    if referral_doc:
        await referrals_col.insert_one({
            "referrerId": str(referral_doc["_id"]),
            "refereeId": str(result.inserted_id),
            "referralCode": req.referralCode,
            "createdAt": now,
        })
        await users_col.update_one({"_id": referral_doc["_id"]}, {"$inc": {"referralCount": 1}})

    token = create_access_token({"sub": str(result.inserted_id), "role": req.role.value})
    await log_audit(str(result.inserted_id), "user_signup", "user", str(result.inserted_id))

    return TokenResponse(accessToken=token, user=user_to_dict(user_doc))


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    user = await users_col.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.get("isBlacklisted"):
        raise HTTPException(status_code=403, detail="Your account has been suspended. Contact support.")

    if user.get("isDeleted"):
        raise HTTPException(status_code=403, detail="Account has been deactivated.")

    token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
    await log_audit(str(user["_id"]), "user_login", "user", str(user["_id"]))
    return TokenResponse(accessToken=token, user=user_to_dict(user))


@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}


@router.post("/change-password")
async def change_password(data: dict, user: dict = Depends(get_current_user)):
    current_password = data.get("currentPassword", "")
    new_password = data.get("newPassword", "")
    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="currentPassword and newPassword are required")
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    if not verify_password(current_password, user.get("passwordHash", "")):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    await users_col.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$set": {"passwordHash": hash_password(new_password), "updatedAt": utcnow()}}
    )
    return {"message": "Password changed successfully"}


@router.get("/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    return user_to_dict(user)


@router.put("/profile")
async def update_profile(req: UpdateProfileRequest, user: dict = Depends(get_current_user)):
    update_data = {}
    if req.name is not None:
        update_data["name"] = req.name
    if req.phone is not None:
        update_data["phone"] = req.phone
    if req.address is not None:
        update_data["address"] = req.address
    if req.emergencyContact is not None:
        update_data["emergencyContact"] = req.emergencyContact

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_data["updatedAt"] = utcnow()
    await users_col.update_one({"_id": ObjectId(user["_id"])}, {"$set": update_data})
    updated = await users_col.find_one({"_id": ObjectId(user["_id"])})
    return user_to_dict(updated)


@router.get("/referral")
async def get_referral_info(user: dict = Depends(get_current_user)):
    """Get current user referral stats and code."""
    referrals = await referrals_col.find({"referrerId": user["_id"]}).to_list(100)
    referral_discount_pct = await get_config_value("referralDiscountPercent", 5.0)
    return {
        "referralCode": user.get("referralCode", ""),
        "referralCount": user.get("referralCount", 0),
        "referralDiscountPercent": referral_discount_pct,
        "referrals": [{"refereeId": r.get("refereeId"), "createdAt": r.get("createdAt")} for r in referrals],
    }
