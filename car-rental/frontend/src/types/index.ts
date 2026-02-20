// ─── Core Types ──────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'owner' | 'admin';
  verified: boolean;
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
}

export interface VehiclePricing {
  currency: string;
  baseRate: number;
  weekendRate?: number;
  minimumDays: number;
  discounts?: { weekly?: number; monthly?: number };
  cleaningFee: number;
  securityDeposit: number;
}

export interface AvailabilityBlock {
  start: string;
  end: string;
  type: 'blocked' | 'maintenance';
}

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
  approvalMode: 'auto' | 'manual';
  availability: AvailabilityBlock[];
  bookedRanges?: DateRange[];
  createdAt?: string;
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
  fees: FeeItem[];
  tax: number;
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
  cancelReason?: string;
  refundAmount?: number;
  vehicle?: {
    title: string;
    images: VehicleImage[];
    location?: string;
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
  type: 'info' | 'success' | 'warning' | 'error';
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

// ─── API Response Types ──────────────────────────────────────
export interface PaginatedResponse<T> {
  total: number;
  page: number;
  pages?: number;
}

export interface VehiclesResponse extends PaginatedResponse<Vehicle> {
  vehicles: Vehicle[];
}

export interface BookingsResponse extends PaginatedResponse<Booking> {
  bookings: Booking[];
}

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
    conversionRate: number;
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
  statusDistribution: Record<string, number>;
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

export interface ImageUploaderProps {
  onUpload: (file: File) => Promise<string>;
  maxSizeMB?: number;
  existingImages?: VehicleImage[];
}
