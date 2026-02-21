// ─── Core Types ──────────────────────────────────────────────

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'owner' | 'admin';
  verified: boolean;
  isVerified?: boolean;
  isBlacklisted?: boolean;
  referralCode?: string;
  referralCount?: number;
  emergencyContact?: EmergencyContact;
  createdAt?: string;
  profile?: Record<string, any>;
}

export interface VehicleImage {
  url: string;
  isPrimary: boolean;
}

export interface VehicleSpecs {
  seats: number;
  transmission: 'auto' | 'manual';
  fuel: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  mileage?: number;
}

export interface VehiclePricing {
  currency: string;
  baseRate: number;
  weekendRate?: number;
  peakSeasonRate?: number;
  minimumDays: number;
  discounts?: { weekly?: number; monthly?: number };
  cleaningFee: number;
  securityDeposit: number;
  lateFeePerHour?: number;
}

export interface PeakSeasonRange {
  start: string;
  end: string;
  label?: string;
}

export interface AvailabilityBlock {
  start: string;
  end: string;
  type: 'blocked' | 'maintenance';
}

export type CancellationPolicy = 'flexible' | 'moderate' | 'strict' | 'non_refundable';

export interface Vehicle {
  _id: string;
  ownerId: string;
  title: string;
  description: string;
  images: VehicleImage[];
  specs: VehicleSpecs;
  pricing: VehiclePricing;
  status: 'active' | 'paused' | 'removed';
  location?: string;
  geoLocation?: GeoLocation;
  approvalMode: 'auto' | 'manual';
  instantBooking?: boolean;
  cancellationPolicy?: CancellationPolicy;
  peakSeasonRanges?: PeakSeasonRange[];
  availability: AvailabilityBlock[];
  bookedRanges?: DateRange[];
  avgRating?: number;
  totalRatings?: number;
  totalBookings?: number;
  ownerVerified?: boolean;
  insuranceVerified?: boolean;
  distanceKm?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DateRange {
  start: string;
  end: string;
  status?: string;
}

export interface FeeItem {
  name: string;
  amount: number;
}

export interface PriceBreakdown {
  days: number;
  base: number;
  subtotal?: number;
  fees: FeeItem[];
  tax: number;
  couponDiscount?: number;
  couponCode?: string;
  total: number;
}

export type BookingStatus =
  | 'draft' | 'pending' | 'held' | 'confirmed'
  | 'active' | 'completed' | 'cancelled'
  | 'disputed' | 'refunded' | 'archived';

export interface Booking {
  _id: string;
  vehicleId: string;
  userId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  days: number;
  priceBreakdown: PriceBreakdown;
  status: BookingStatus;
  holdExpiresAt?: string;
  idempotencyKey: string;
  paymentMethod: string;
  couponCode?: string;
  cancellationPolicy?: CancellationPolicy;
  cancelReason?: string;
  refundAmount?: number;
  lateReturnFee?: number;
  actualReturnTime?: string;
  tripStartReportId?: string;
  tripEndReportId?: string;
  vehicle?: {
    title: string;
    images: VehicleImage[];
    location?: string;
    cancellationPolicy?: CancellationPolicy;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  _id: string;
  bookingId: string;
  method: string;
  amount: number;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  transactionRef?: string;
  createdAt?: string;
}

export interface Review {
  _id: string;
  bookingId: string;
  vehicleId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface Notification {
  _id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'booking';
  read: boolean;
  link?: string;
  createdAt?: string;
}

export interface AuditLog {
  _id: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  payload?: Record<string, any>;
  createdAt?: string;
}

// ─── Coupon ──────────────────────────────────────────────────
export type CouponType = 'percentage' | 'fixed';

export interface Coupon {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  maxDiscount?: number;
  minBookingAmount?: number;
  expiresAt?: string;
  usageLimit?: number;
  perUserLimit?: number;
  usedCount?: number;
  firstTimeOnly?: boolean;
  isActive: boolean;
  description?: string;
  createdAt?: string;
}

// ─── Trip Reports ─────────────────────────────────────────────
export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  note?: string;
}

export interface TripReport {
  _id: string;
  bookingId: string;
  vehicleId: string;
  type: 'pre_trip' | 'post_trip';
  checklist: ChecklistItem[];
  odometerReading?: number;
  fuelLevel?: string;
  damageDescription?: string;
  extraCharges?: number;
  photos?: string[];
  createdBy: string;
  createdAt?: string;
}

// ─── Verifications ────────────────────────────────────────────
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type VerificationType = 'aadhaar' | 'license' | 'insurance' | 'owner_badge';

export interface Verification {
  _id: string;
  userId: string;
  type: VerificationType;
  status: VerificationStatus;
  documents?: string[];
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
}

// ─── Announcements ────────────────────────────────────────────
export interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetRole?: 'user' | 'owner' | 'admin' | 'all';
  expiresAt?: string;
  createdAt?: string;
}

// ─── Saved Searches ───────────────────────────────────────────
export interface SavedSearch {
  _id: string;
  userId: string;
  name: string;
  filters: Record<string, any>;
  createdAt?: string;
}

// ─── Analytics ───────────────────────────────────────────────
export interface AnalyticsData {
  summary: {
    totalUsers: number;
    totalOwners: number;
    totalVehicles: number;
    totalBookings: number;
  };
  period: {
    range: string;
    bookings: number;
    cancelled: number;
    completed: number;
    revenue: number;
    gmv?: number;
    commissionRevenue?: number;
    conversionRate: number;
    cancellationRate?: number;
  };
  monthlyTrend: {
    month: string;
    revenue: number;
    count: number;
  }[];
  topVehicles: {
    vehicleId: string;
    title: string;
    bookings: number;
  }[];
  statusDistribution: { status: string; count: number }[];
  topCities?: { city: string; vehicles: number }[];
  userGrowth?: { month: string; newUsers: number }[];
  fraudAlerts?: { userId: string; name: string; email: string; disputes: number }[];
}

export interface OwnerAnalytics {
  period: string;
  totalBookings: number;
  periodBookings: number;
  periodRevenue: number;
  ownerEarnings: number;
  occupancyRate: number;
  cancellationRate: number;
  monthlyProjection: number;
  monthlyTrend: { month: string; revenue: number; bookings: number }[];
}

// ─── Config ───────────────────────────────────────────────────
export interface PlatformConfig {
  _id: string;
  key: string;
  value: number | string | boolean;
  description?: string;
  updatedAt?: string;
}

// ─── API Response Types ──────────────────────────────────────
export interface PaginatedResponse<T> {
  total: number;
  page: number;
  pages?: number;
}

// ─── Component Props ─────────────────────────────────────────
export interface VehicleCardProps {
  vehicle: Vehicle;
  onQuickBook?: (vehicleId: string) => void;
  onView?: (vehicleId: string) => void;
}

export interface BookingCalendarProps {
  vehicleId: string;
  bookedRanges: DateRange[];
  blockedRanges: AvailabilityBlock[];
  onSelectRange: (start: Date, end: Date) => void;
}

export interface BookingStepperProps {
  currentStep: number;
  steps: string[];
}
