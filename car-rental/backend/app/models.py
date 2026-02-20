from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from bson import ObjectId


# ─── Helpers ──────────────────────────────────────────────────
class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, *args):
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str) and ObjectId.is_valid(v):
            return v
        raise ValueError("Invalid ObjectId")


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ─── Enums ────────────────────────────────────────────────────
class UserRole(str, Enum):
    USER = "user"
    OWNER = "owner"
    ADMIN = "admin"


class VehicleStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    REMOVED = "removed"


class BookingStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    HELD = "held"
    CONFIRMED = "confirmed"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DISPUTED = "disputed"
    REFUNDED = "refunded"
    ARCHIVED = "archived"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    REFUNDED = "refunded"


class AvailabilityBlockType(str, Enum):
    BLOCKED = "blocked"
    MAINTENANCE = "maintenance"


# ─── Auth Schemas ─────────────────────────────────────────────
class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    role: UserRole = UserRole.USER


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    accessToken: str
    user: Dict[str, Any]


class UserOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    name: str
    email: str
    role: str
    verified: bool = False
    createdAt: Optional[datetime] = None
    profile: Optional[Dict[str, Any]] = None


# ─── Vehicle Schemas ──────────────────────────────────────────
class VehicleImageSchema(BaseModel):
    url: str
    isPrimary: bool = False


class VehicleSpecs(BaseModel):
    seats: int = 5
    transmission: str = "auto"
    fuel: str = "petrol"
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    color: Optional[str] = None


class VehiclePricing(BaseModel):
    currency: str = "INR"
    baseRate: float
    weekendRate: Optional[float] = None
    minimumDays: int = 1
    discounts: Optional[Dict[str, float]] = None  # {"weekly": 0.1, "monthly": 0.2}
    cleaningFee: float = 0.0
    securityDeposit: float = 0.0


class AvailabilityBlock(BaseModel):
    start: datetime
    end: datetime
    type: AvailabilityBlockType = AvailabilityBlockType.BLOCKED


class VehicleCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field("", max_length=2000)
    specs: VehicleSpecs = VehicleSpecs()
    pricing: VehiclePricing
    location: Optional[str] = None
    approvalMode: str = "auto"  # "auto" | "manual"
    availability: List[AvailabilityBlock] = []


class VehicleUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    specs: Optional[VehicleSpecs] = None
    pricing: Optional[VehiclePricing] = None
    status: Optional[VehicleStatus] = None
    location: Optional[str] = None
    approvalMode: Optional[str] = None
    availability: Optional[List[AvailabilityBlock]] = None


class VehicleOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    ownerId: str
    title: str
    description: str = ""
    images: List[VehicleImageSchema] = []
    specs: VehicleSpecs = VehicleSpecs()
    pricing: VehiclePricing
    status: str = "active"
    location: Optional[str] = None
    approvalMode: str = "auto"
    availability: List[AvailabilityBlock] = []
    createdAt: Optional[datetime] = None


# ─── Booking Schemas ─────────────────────────────────────────
class FeeItem(BaseModel):
    name: str
    amount: float


class PriceBreakdown(BaseModel):
    days: int
    base: float
    fees: List[FeeItem] = []
    tax: float = 0.0
    total: float = 0.0


class BookingCreateRequest(BaseModel):
    idempotencyKey: str = Field(..., min_length=5)
    vehicleId: str
    startDate: datetime
    endDate: datetime
    priceBreakdown: Optional[PriceBreakdown] = None
    paymentMethod: str = "mock_card"


class BookingCancelRequest(BaseModel):
    reason: Optional[str] = None


class BookingResolveRequest(BaseModel):
    resolution: str  # "refund" | "no_refund"
    notes: Optional[str] = None


class BookingOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    vehicleId: str
    userId: str
    ownerId: str
    startDate: datetime
    endDate: datetime
    days: int
    priceBreakdown: PriceBreakdown
    status: str
    holdExpiresAt: Optional[datetime] = None
    idempotencyKey: str
    paymentMethod: str = "mock_card"
    cancelReason: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None


# ─── Payment Schemas ─────────────────────────────────────────
class PaymentChargeRequest(BaseModel):
    bookingId: str
    method: str = "mock_card"
    amount: float


class PaymentRefundRequest(BaseModel):
    bookingId: str
    amount: Optional[float] = None  # None = full refund


class PaymentOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    bookingId: str
    method: str
    amount: float
    status: str
    transactionRef: Optional[str] = None
    createdAt: Optional[datetime] = None


# ─── Review Schemas ───────────────────────────────────────────
class ReviewCreateRequest(BaseModel):
    bookingId: str
    vehicleId: str
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field("", max_length=1000)


class ReviewOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    bookingId: str
    vehicleId: str
    userId: str
    rating: int
    comment: str = ""
    createdAt: Optional[datetime] = None


# ─── Notification Schemas ────────────────────────────────────
class NotificationOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    userId: str
    message: str
    type: str = "info"
    read: bool = False
    link: Optional[str] = None
    createdAt: Optional[datetime] = None


# ─── Audit Log ────────────────────────────────────────────────
class AuditLogEntry(BaseModel):
    actorId: str
    action: str
    resourceType: str
    resourceId: str
    payload: Optional[Dict[str, Any]] = None
    createdAt: datetime = Field(default_factory=utcnow)
