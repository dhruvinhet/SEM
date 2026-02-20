import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehiclesAPI, reviewsAPI, bookingsAPI, paymentsAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import BookingStepper from '../components/BookingStepper';
import StatusBadge from '../components/StatusBadge';
import { ErrorState } from '../components/States';
import {
  MapPin, Users, Fuel, Settings2, Star, Calendar,
  ChevronLeft, ChevronRight, Shield, Clock, CreditCard, Check, X,
} from 'lucide-react';
import { format, addDays, differenceInDays, isAfter, isBefore, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import type { Vehicle, Review } from '../types';

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking state
  const [bookingStep, setBookingStep] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mock_card');
  const [booking, setBooking] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [holdTimer, setHoldTimer] = useState<number | null>(null);

  // Image gallery
  const [activeImage, setActiveImage] = useState(0);

  const STEPS = ['Select Dates', 'Review Price', 'Payment', 'Confirmation'];

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [vehicleRes, reviewsRes] = await Promise.all([
          vehiclesAPI.get(id),
          reviewsAPI.getForVehicle(id),
        ]);
        setVehicle(vehicleRes.data);
        setReviews(reviewsRes.data.reviews);
        setAvgRating(reviewsRes.data.averageRating);
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to load vehicle');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Hold TTL timer
  useEffect(() => {
    if (!booking?.holdExpiresAt) return;
    const interval = setInterval(() => {
      const now = new Date();
      const expires = new Date(booking.holdExpiresAt);
      const diff = Math.max(0, Math.floor((expires.getTime() - now.getTime()) / 1000));
      setHoldTimer(diff);
      if (diff <= 0) {
        clearInterval(interval);
        toast.error('Hold has expired');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [booking?.holdExpiresAt]);

  const days = startDate && endDate
    ? Math.max(differenceInDays(new Date(endDate), new Date(startDate)), 1)
    : 0;

  const estimatedTotal = vehicle && days > 0
    ? (() => {
        const base = days * vehicle.pricing.baseRate;
        const cleaning = vehicle.pricing.cleaningFee || 0;
        const serviceFee = Math.round(base * 0.05);
        const tax = Math.round((base + serviceFee + cleaning) * 0.18);
        const deposit = vehicle.pricing.securityDeposit || 0;
        return base + cleaning + serviceFee + tax + deposit;
      })()
    : 0;

  const isDateBlocked = (dateStr: string) => {
    if (!vehicle) return false;
    const d = new Date(dateStr);
    // Check availability blocks
    for (const block of vehicle.availability || []) {
      if (d >= new Date(block.start) && d <= new Date(block.end)) return true;
    }
    // Check booked ranges
    for (const range of vehicle.bookedRanges || []) {
      if (d >= new Date(range.start) && d <= new Date(range.end)) return true;
    }
    return false;
  };

  const handleCreateBooking = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    if (!vehicle || !startDate || !endDate) return;

    setBookingLoading(true);
    try {
      const idempotencyKey = `${user?._id}_${vehicle._id}_${startDate}_${endDate}`;
      const res = await bookingsAPI.create({
        idempotencyKey,
        vehicleId: vehicle._id,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        paymentMethod,
      });
      setBooking(res.data);
      setBookingStep(2); // Move to payment step
      toast.success('Booking hold created!');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!booking) return;
    setBookingLoading(true);
    try {
      // Simulate payment
      await paymentsAPI.charge({
        bookingId: booking._id,
        method: paymentMethod,
        amount: booking.priceBreakdown.total,
      });
      // Confirm booking
      const res = await bookingsAPI.confirm(booking._id);
      setBooking(res.data);
      setBookingStep(3); // Confirmation step
      toast.success('Payment successful! Booking confirmed.');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Payment failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-[400px] bg-gray-200 rounded-2xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return <ErrorState message={error || 'Vehicle not found'} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 text-sm">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back
      </button>

      {/* Image Gallery */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-[300px] sm:h-[400px] lg:h-[500px]">
        {vehicle.images.length > 0 ? (
          <>
            <img
              src={vehicle.images[activeImage]?.url}
              alt={`${vehicle.title} - Image ${activeImage + 1}`}
              className="w-full h-full object-cover"
            />
            {vehicle.images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((prev) => (prev === 0 ? vehicle.images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImage((prev) => (prev === vehicle.images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {vehicle.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeImage ? 'bg-white w-6' : 'bg-white/50'}`}
                      aria-label={`View image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No images</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Details */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-dark-700">{vehicle.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-dark-400 flex-wrap">
              {vehicle.location && (
                <span className="flex items-center gap-1 text-sm">
                  <MapPin className="w-4 h-4" /> {vehicle.location}
                </span>
              )}
              {avgRating > 0 && (
                <span className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {avgRating} ({reviews.length} reviews)
                </span>
              )}
            </div>
          </div>

          {/* Specs */}
          <div className="card p-6">
            <h3 className="font-semibold text-dark-700 mb-4">Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Users, label: 'Seats', value: vehicle.specs.seats },
                { icon: Settings2, label: 'Transmission', value: vehicle.specs.transmission === 'auto' ? 'Automatic' : 'Manual' },
                { icon: Fuel, label: 'Fuel', value: vehicle.specs.fuel },
                ...(vehicle.specs.year ? [{ icon: Calendar, label: 'Year', value: vehicle.specs.year }] : []),
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center p-3 bg-gray-50 rounded-xl">
                  <Icon className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                  <p className="text-xs text-dark-400">{label}</p>
                  <p className="font-semibold text-dark-700 text-sm capitalize">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {vehicle.description && (
            <div className="card p-6">
              <h3 className="font-semibold text-dark-700 mb-3">About this car</h3>
              <p className="text-dark-400 text-sm leading-relaxed">{vehicle.description}</p>
            </div>
          )}

          {/* Reviews */}
          <div className="card p-6">
            <h3 className="font-semibold text-dark-700 mb-4">
              Reviews {reviews.length > 0 && `(${reviews.length})`}
            </h3>
            {reviews.length === 0 ? (
              <p className="text-dark-400 text-sm">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.slice(0, 5).map((r) => (
                  <div key={r._id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-dark-400">
                        {r.createdAt ? format(new Date(r.createdAt), 'MMM d, yyyy') : ''}
                      </span>
                    </div>
                    <p className="text-sm text-dark-600">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-3xl font-bold text-dark-700">
                  ₹{vehicle.pricing.baseRate.toLocaleString()}
                </span>
                <span className="text-dark-400">/day</span>
              </div>
              {vehicle.pricing.weekendRate && (
                <span className="text-xs text-dark-400 bg-gray-50 px-2 py-1 rounded-lg">
                  Weekend: ₹{vehicle.pricing.weekendRate.toLocaleString()}
                </span>
              )}
            </div>

            {/* Booking Stepper */}
            {bookingStep > 0 && (
              <BookingStepper currentStep={bookingStep} steps={STEPS} />
            )}

            {/* Step 0 & 1: Select Dates */}
            {bookingStep <= 1 && (
              <div className="space-y-4">
                <div>
                  <label className="label">Pick-up Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="input-field"
                    aria-label="Pick-up date"
                  />
                </div>
                <div>
                  <label className="label">Return Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                    className="input-field"
                    aria-label="Return date"
                  />
                </div>

                {/* Price estimate */}
                {days > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 animate-fade-in">
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">{days} day{days > 1 ? 's' : ''} × ₹{vehicle.pricing.baseRate.toLocaleString()}</span>
                      <span className="text-dark-600">₹{(days * vehicle.pricing.baseRate).toLocaleString()}</span>
                    </div>
                    {vehicle.pricing.cleaningFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-400">Cleaning fee</span>
                        <span className="text-dark-600">₹{vehicle.pricing.cleaningFee.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">Service fee (5%)</span>
                      <span className="text-dark-600">₹{Math.round(days * vehicle.pricing.baseRate * 0.05).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">Tax (18%)</span>
                      <span className="text-dark-600">₹{Math.round((days * vehicle.pricing.baseRate * 1.05 + (vehicle.pricing.cleaningFee || 0)) * 0.18).toLocaleString()}</span>
                    </div>
                    {vehicle.pricing.securityDeposit > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-400">Security deposit (refundable)</span>
                        <span className="text-dark-600">₹{vehicle.pricing.securityDeposit.toLocaleString()}</span>
                      </div>
                    )}
                    <hr className="border-gray-200" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-dark-700">Total</span>
                      <span className="text-dark-700 text-lg">₹{estimatedTotal.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!startDate || !endDate) {
                      toast.error('Please select dates');
                      return;
                    }
                    if (bookingStep === 0) setBookingStep(1);
                    else handleCreateBooking();
                  }}
                  disabled={!startDate || !endDate || bookingLoading}
                  className="btn-primary w-full"
                >
                  {bookingStep === 0 ? 'Check Availability' : bookingLoading ? 'Processing...' : 'Reserve Now'}
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {bookingStep === 2 && booking && (
              <div className="space-y-4 animate-fade-in">
                {/* Hold timer */}
                {holdTimer !== null && holdTimer > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Hold expires in</p>
                      <p className="text-lg font-bold text-yellow-700">
                        {Math.floor(holdTimer / 60)}:{String(holdTimer % 60).padStart(2, '0')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Price summary */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <h4 className="font-semibold text-dark-700">Price Breakdown</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-400">Base ({booking.priceBreakdown.days} days)</span>
                    <span>₹{booking.priceBreakdown.base.toLocaleString()}</span>
                  </div>
                  {booking.priceBreakdown.fees?.map((f: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-dark-400">{f.name}</span>
                      <span className={f.amount < 0 ? 'text-green-600' : ''}>
                        {f.amount < 0 ? '-' : ''}₹{Math.abs(f.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-400">Tax</span>
                    <span>₹{booking.priceBreakdown.tax.toLocaleString()}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-lg">₹{booking.priceBreakdown.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <label className="label">Payment Method</label>
                  <div className="space-y-2">
                    {[
                      { value: 'mock_card', label: 'Credit/Debit Card', icon: CreditCard },
                      { value: 'upi', label: 'UPI', icon: Shield },
                      { value: 'wallet', label: 'Wallet', icon: Shield },
                    ].map(({ value, label, icon: Icon }) => (
                      <label
                        key={value}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                          paymentMethod === value ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={value}
                          checked={paymentMethod === value}
                          onChange={() => setPaymentMethod(value)}
                          className="sr-only"
                        />
                        <Icon className="w-5 h-5 text-dark-400" />
                        <span className="text-sm font-medium text-dark-700">{label}</span>
                        {paymentMethod === value && <Check className="w-5 h-5 text-primary-500 ml-auto" />}
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={bookingLoading}
                  className="btn-primary w-full"
                >
                  {bookingLoading ? 'Processing payment...' : `Pay ₹${booking.priceBreakdown.total.toLocaleString()}`}
                </button>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {bookingStep === 3 && booking && (
              <div className="text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-dark-700">Booking Confirmed!</h3>
                <p className="text-dark-400 text-sm">
                  Your booking for {vehicle.title} has been confirmed.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-400">Booking ID</span>
                    <span className="font-mono text-dark-700">{booking._id?.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">Status</span>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">Dates</span>
                    <span className="text-dark-700">
                      {format(new Date(booking.startDate), 'MMM d')} - {format(new Date(booking.endDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/user/dashboard')}
                  className="btn-primary w-full"
                >
                  Go to Dashboard
                </button>
              </div>
            )}

            {/* Features */}
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
              {[
                { icon: Shield, text: 'Free cancellation (48h+)' },
                { icon: Clock, text: '15-min hold during payment' },
                { icon: Star, text: 'Verified owner & vehicle' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-dark-400">
                  <Icon className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
