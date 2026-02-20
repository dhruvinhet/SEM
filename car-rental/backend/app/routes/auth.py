from fastapi import APIRouter, HTTPException, status
from app.models import SignupRequest, LoginRequest, TokenResponse, utcnow
from app.auth import hash_password, verify_password, create_access_token
from app.database import users_col
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
        "createdAt": user.get("createdAt"),
        "profile": user.get("profile", {}),
    }


@router.post("/signup", response_model=TokenResponse, status_code=201)
async def signup(req: SignupRequest):
    existing = await users_col.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name": req.name,
        "email": req.email,
        "passwordHash": hash_password(req.password),
        "role": req.role.value,
        "verified": False,
        "createdAt": utcnow(),
        "profile": {},
    }
    result = await users_col.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = create_access_token({"sub": str(result.inserted_id), "role": req.role.value})
    await log_audit(str(result.inserted_id), "user_signup", "user", str(result.inserted_id))

    return TokenResponse(accessToken=token, user=user_to_dict(user_doc))


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    user = await users_col.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
    return TokenResponse(accessToken=token, user=user_to_dict(user))


@router.post("/logout")
async def logout():
    # For stateless JWT, logout is handled client-side
    return {"message": "Logged out successfully"}


@router.get("/me")
async def get_me(user: dict = None):
    """Get current user info - requires auth handled by dependency."""
    from app.auth import get_current_user
    from fastapi import Depends
    # This is handled via dependency injection in main router
    pass


# Separate endpoint with dependency
from fastapi import Depends
from app.auth import get_current_user


@router.get("/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    return user_to_dict(user)
