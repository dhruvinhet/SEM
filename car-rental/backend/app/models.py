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


class CancellationPolicy(str, Enum):
    FLEXIBLE = "flexible"        # Full refund 24h before, 50% 12h, none after
    MODERATE = "moderate"        # Full refund 48h before, 50% 24h, none after
    STRICT = "strict"            # 50% refund 72h before, none after
    NON_REFUNDABLE = "non_refundable"


class VerificationStatus(str, Enum):
    PENDING = "pending"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REJECTED = "rejected"


class CouponType(str, Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"


class TripReportType(str, Enum):
    PRE_TRIP = "pre_trip"
    POST_TRIP = "post_trip"


# ─── Auth Schemas ─────────────────────────────────────────────
class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    role: UserRole = UserRole.USER
    referralCode: Optional[str] = None


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
    isVerified: bool = False
    isBlacklisted: bool = False
    emergencyContact: Optional[Dict[str, str]] = None
    referralCode: Optional[str] = None
    referralCount: int = 0
    createdAt: Optional[datetime] = None
    profile: Optional[Dict[str, Any]] = None


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergencyContact: Optional[Dict[str, str]] = None  # {name, phone, relation}


class GeoLocation(BaseModel):
    lat: float
    lng: float
    address: Optional[str] = None


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
    mileage: Optional[float] = None  # km/l


class PeakSeasonRange(BaseModel):
    start: str  # "MM-DD" format e.g. "12-15"
    end: str    # "MM-DD" format e.g. "01-15"
    label: Optional[str] = None


class VehiclePricing(BaseModel):
    currency: str = "INR"
    baseRate: float
    weekendRate: Optional[float] = None
    peakSeasonRate: Optional[float] = None
    minimumDays: int = 1
    discounts: Optional[Dict[str, float]] = None  # {"weekly": 0.1, "monthly": 0.2}
    cleaningFee: float = 0.0
    securityDeposit: float = 0.0
    lateFeePerHour: float = 0.0  # Late return fee per hour


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
    geoLocation: Optional[GeoLocation] = None
    approvalMode: str = "auto"  # "auto" | "manual"
    availability: List[AvailabilityBlock] = []
    cancellationPolicy: CancellationPolicy = CancellationPolicy.MODERATE
    instantBooking: bool = True
    peakSeasonRanges: List[PeakSeasonRange] = []


class VehicleUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    specs: Optional[VehicleSpecs] = None
    pricing: Optional[VehiclePricing] = None
    status: Optional[VehicleStatus] = None
    location: Optional[str] = None
    geoLocation: Optional[GeoLocation] = None
    approvalMode: Optional[str] = None
    availability: Optional[List[AvailabilityBlock]] = None
    cancellationPolicy: Optional[CancellationPolicy] = None
    instantBooking: Optional[bool] = None
    peakSeasonRanges: Optional[List[PeakSeasonRange]] = None


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
    geoLocation: Optional[GeoLocation] = None
    approvalMode: str = "auto"
    availability: List[AvailabilityBlock] = []
    cancellationPolicy: str = "moderate"
    instantBooking: bool = True
    insuranceVerified: bool = False
    ownerVerified: bool = False
    avgRating: float = 0.0
    totalRatings: int = 0
    totalBookings: int = 0
    peakSeasonRanges: List[PeakSeasonRange] = []
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
    couponDiscount: float = 0.0
    couponCode: Optional[str] = None


class BookingCreateRequest(BaseModel):
    idempotencyKey: str = Field(..., min_length=5)
    vehicleId: str
    startDate: datetime
    endDate: datetime
    priceBreakdown: Optional[PriceBreakdown] = None
    paymentMethod: str = "mock_card"
    couponCode: Optional[str] = None


class BookingCancelRequest(BaseModel):
    reason: Optional[str] = None


class BookingResolveRequest(BaseModel):
    resolution: str  # "refund" | "no_refund"
    notes: Optional[str] = None


class LateReturnRequest(BaseModel):
    returnTime: datetime
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
    refundAmount: Optional[float] = None
    lateReturnFee: Optional[float] = None
    tripStartReportId: Optional[str] = None
    tripEndReportId: Optional[str] = None
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


# ─── Coupon Schemas ───────────────────────────────────────────
class CouponCreateRequest(BaseModel):
    code: str = Field(..., min_length=3, max_length=30)
    type: CouponType
    value: float = Field(..., gt=0)
    minBookingAmount: float = 0.0
    maxDiscount: Optional[float] = None
    expiresAt: Optional[datetime] = None
    usageLimit: int = 100
    perUserLimit: int = 1
    description: str = ""
    forFirstTimeOnly: bool = False


class CouponOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    code: str
    type: str
    value: float
    minBookingAmount: float
    maxDiscount: Optional[float]
    expiresAt: Optional[datetime]
    usageLimit: int
    usedCount: int
    perUserLimit: int
    description: str
    forFirstTimeOnly: bool
    isActive: bool
    createdAt: Optional[datetime] = None


class CouponValidateRequest(BaseModel):
    code: str
    bookingAmount: float


# ─── Trip Report Schemas ──────────────────────────────────────
class ChecklistItem(BaseModel):
    label: str
    checked: bool = False


class TripReportCreateRequest(BaseModel):
    bookingId: str
    reportType: TripReportType
    checklist: List[ChecklistItem] = []
    odometerReading: Optional[float] = None
    fuelLevel: Optional[str] = None
    notes: Optional[str] = None
    damageDescription: Optional[str] = None
    extraCharges: float = 0.0
    extraChargesReason: Optional[str] = None


class TripReportOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    bookingId: str
    reportedBy: str
    reportType: str
    checklist: List[ChecklistItem]
    odometerReading: Optional[float]
    fuelLevel: Optional[str]
    photos: List[str] = []
    notes: Optional[str]
    damageDescription: Optional[str]
    extraCharges: float
    extraChargesReason: Optional[str]
    createdAt: Optional[datetime] = None


# ─── Verification Schemas ──────────────────────────────────────
class VerificationCreateRequest(BaseModel):
    verificationType: str  # "aadhaar", "license", "insurance", "owner_badge"
    documentNumber: Optional[str] = None
    notes: Optional[str] = None


class VerificationOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    userId: str
    vehicleId: Optional[str] = None
    verificationType: str
    documentNumber: Optional[str] = None
    status: str = "pending"
    documentUrls: List[str] = []
    notes: Optional[str] = None
    adminNotes: Optional[str] = None
    reviewedBy: Optional[str] = None
    createdAt: Optional[datetime] = None
    reviewedAt: Optional[datetime] = None


# ─── Announcement Schemas ──────────────────────────────────────
class AnnouncementCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    message: str = Field(..., min_length=5, max_length=2000)
    targetRole: Optional[str] = None
    link: Optional[str] = None
    expiresAt: Optional[datetime] = None


class AnnouncementOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    title: str
    message: str
    targetRole: Optional[str] = None
    link: Optional[str] = None
    expiresAt: Optional[datetime] = None
    createdBy: str
    createdAt: Optional[datetime] = None


# ─── Saved Search Schemas ──────────────────────────────────────
class SavedSearchRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    filters: Dict[str, Any]


class SavedSearchOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    userId: str
    name: str
    filters: Dict[str, Any]
    createdAt: Optional[datetime] = None


# ─── Config Schemas ────────────────────────────────────────────
class ConfigUpdateRequest(BaseModel):
    key: str
    value: Any
    description: Optional[str] = None


class ConfigOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    key: str
    value: Any
    description: Optional[str] = None
    updatedAt: Optional[datetime] = None
    updatedBy: Optional[str] = None


# ─── Blacklist Schemas ─────────────────────────────────────────
class BlacklistRequest(BaseModel):
    userId: str
    reason: str


# ─── Admin CRUD Schemas ────────────────────────────────────────
class AdminCreateUserRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.USER


class AdminUpdateUserRequest(BaseModel):
    name: Optional[str] = None
    role: Optional[UserRole] = None
    verified: Optional[bool] = None
    isVerified: Optional[bool] = None


class AdminCreateBookingRequest(BaseModel):
    vehicleId: str
    userId: str
    startDate: datetime
    endDate: datetime
    paymentMethod: str = "mock_card"


class BulkApproveRequest(BaseModel):
    vehicleIds: List[str]


class BulkCancelRequest(BaseModel):
    bookingIds: List[str]
    reason: Optional[str] = "Admin cancelled"
