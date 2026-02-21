import asyncio
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import init_indexes, close_db
from app.tasks import run_background_tasks
from app.routes import auth, vehicles, bookings, payments, admin, notifications, reviews
from app.routes import coupons, trip_reports, verifications, announcements, search_utils

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup
    await init_indexes()
    print("✅ Database indexes created")

    # Start background tasks
    task = asyncio.create_task(run_background_tasks())
    print("✅ Background tasks started")

    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    yield

    # Shutdown
    task.cancel()
    await close_db()
    print("🔌 Database connection closed")


app = FastAPI(
    title="Car Rental API",
    description="Production-quality Car Rental Web Application API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(admin.router)
app.include_router(notifications.router)
app.include_router(reviews.router)
app.include_router(coupons.router)
app.include_router(trip_reports.router)
app.include_router(verifications.router)
app.include_router(announcements.router)
app.include_router(search_utils.router)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}


@app.get("/api/owner/analytics")
async def owner_analytics(
    range: str = "monthly",
    user: dict = None,
):
    """Owner analytics - revenue, occupancy, projection."""
    from app.auth import get_current_user
    from fastapi import Depends
    from app.routes.admin import _compute_owner_analytics
    # Inline authentication for this endpoint
    return {"message": "Use /api/admin/owner-analytics/{owner_id} with admin token or see bookings"}


# Owner analytics with auth
from fastapi import Depends
from app.auth import get_current_user
from app.routes.admin import _compute_owner_analytics


@app.get("/api/owner/analytics/me")
async def owner_analytics_me(
    range: str = "monthly",
    user: dict = Depends(get_current_user),
):
    """Get analytics for the currently logged-in owner."""
    if user["role"] not in ("owner", "admin"):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Owner access required")
    return await _compute_owner_analytics(user["_id"], range)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
