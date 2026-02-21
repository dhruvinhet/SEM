import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { bookingsAPI, reviewsAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import StatusBadge from '../components/StatusBadge';
import { BookingRowSkeleton } from '../components/Skeletons';
import { EmptyState, ErrorState } from '../components/States';
import ScrollReveal from '../components/ScrollReveal';
import SpeedometerGauge from '../components/SpeedometerGauge';
import AnimatedTabs from '../components/AnimatedTabs';
import {
  Calendar, Car, ChevronRight, Clock, FileText, Star, X, AlertTriangle, MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';
import { customToast } from '../components/CustomToast';
import type { Booking } from '../types';

type Tab = 'all' | 'upcoming' | 'active' | 'completed' | 'cancelled';

export default function UserDashboard() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('all');

  // Detail modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Review form
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingsAPI.list({ page: 1, limit: 100 });
      setBookings(res.data.items || res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return ['pending', 'held', 'confirmed'].includes(b.status);
    if (activeTab === 'active') return b.status === 'active';
    if (activeTab === 'completed') return ['completed', 'archived'].includes(b.status);
    if (activeTab === 'cancelled') return ['cancelled', 'refunded', 'disputed'].includes(b.status);
    return true;
  });

  const handleCancel = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await bookingsAPI.cancel(selectedBooking._id, cancelReason);
      customToast.booking('Booking cancelled');
      setCancelReason('');
      setSelectedBooking(null);
      loadBookings();
    } catch (err: any) {
      customToast.error(err?.response?.data?.detail || 'Cancel failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispute = async () => {
    if (!selectedBooking || !disputeReason.trim()) return;
    setActionLoading(true);
    try {
      await bookingsAPI.dispute(selectedBooking._id, disputeReason);
      customToast.success('Dispute submitted');
      setDisputeReason('');
      setSelectedBooking(null);
      loadBookings();
    } catch (err: any) {
      customToast.error(err?.response?.data?.detail || 'Dispute failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await reviewsAPI.create({
        vehicleId: selectedBooking.vehicleId,
        bookingId: selectedBooking._id,
        rating: reviewRating,
        comment: reviewComment,
      });
      customToast.review('Review submitted!');
      setShowReview(false);
      setReviewRating(5);
      setReviewComment('');
    } catch (err: any) {
      customToast.error(err?.response?.data?.detail || 'Submit review failed');
    } finally {
      setActionLoading(false);
    }
  };

  const canCancel = (s: string) => ['pending', 'held', 'confirmed'].includes(s);
  const canDispute = (s: string) => ['completed', 'active'].includes(s);
  const canReview = (s: string) => s === 'completed';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white">My Bookings</h1>
        <p className="text-dark-400 mt-1">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</p>
      </div>

      {/* Quick stats — speedometer gauges */}
      <ScrollReveal>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 flex flex-col items-center">
            <SpeedometerGauge value={bookings.length} max={Math.max(bookings.length, 20)} label="Total" displayValue={String(bookings.length)} color="#00d4ff" glowColor="#00d4ff" size={110} />
          </div>
          <div className="card p-4 flex flex-col items-center">
            <SpeedometerGauge value={bookings.filter((b) => b.status === 'active').length} max={Math.max(bookings.length, 10)} label="Active" displayValue={String(bookings.filter((b) => b.status === 'active').length)} color="#22c55e" glowColor="#22c55e" size={110} />
          </div>
          <div className="card p-4 flex flex-col items-center">
            <SpeedometerGauge value={bookings.filter((b) => ['pending', 'held', 'confirmed'].includes(b.status)).length} max={Math.max(bookings.length, 10)} label="Upcoming" displayValue={String(bookings.filter((b) => ['pending', 'held', 'confirmed'].includes(b.status)).length)} color="#eab308" glowColor="#eab308" size={110} />
          </div>
          <div className="card p-4 flex flex-col items-center">
            <SpeedometerGauge value={bookings.filter((b) => b.status === 'completed').length} max={Math.max(bookings.length, 10)} label="Completed" displayValue={String(bookings.filter((b) => b.status === 'completed').length)} color="#a855f7" glowColor="#a855f7" size={110} />
          </div>
        </div>
      </ScrollReveal>

      {/* Tabs */}
      <AnimatedTabs
        tabs={tabs.map((t) => ({ key: t.key, label: t.label }))}
        activeTab={activeTab}
        onTabChange={(key) => setActiveTab(key as Tab)}
      />
      <div className="mb-6" />

      {/* Booking list */}
      {loading ? (
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <BookingRowSkeleton key={i} />)}</div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadBookings} />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description={activeTab === 'all' ? 'Start by browsing our vehicles!' : `No ${activeTab} bookings.`}
          actionLabel={activeTab === 'all' ? 'Browse Vehicles' : undefined}
          actionHref={activeTab === 'all' ? '/search' : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b._id}
              className="card p-4 sm:p-6 hover:shadow-elevated transition-shadow cursor-pointer"
              onClick={() => setSelectedBooking(b)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-14 rounded-xl bg-dark-800 overflow-hidden flex-shrink-0">
                    {b.vehicle?.images?.[0]?.url ? (
                      <img src={b.vehicle.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-6 h-6 text-dark-500" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      {b.vehicle?.title || 'Vehicle'}
                    </h3>
                    <p className="text-xs text-dark-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(b.startDate), 'MMM d')} − {format(new Date(b.endDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={b.status} />
                  <span className="text-sm font-bold text-white">
                    ₹{b.priceBreakdown?.total?.toLocaleString() || '—'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-dark-300 hidden sm:block" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-dark-800/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
              <h2 className="text-lg font-bold text-white">Booking Details</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-dark-300 hover:text-dark-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-400">Status</span>
                <StatusBadge status={selectedBooking.status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark-400">Vehicle</span>
                <Link
                  to={`/vehicle/${selectedBooking.vehicleId}`}
                  className="text-sm text-primary-400 hover:underline"
                >
                  {selectedBooking.vehicle?.title || 'View Vehicle'}
                </Link>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-dark-400">Dates</span>
                <span className="text-sm text-white">
                  {format(new Date(selectedBooking.startDate), 'MMM d')} − {format(new Date(selectedBooking.endDate), 'MMM d, yyyy')}
                </span>
              </div>

              {/* Price breakdown */}
              {selectedBooking.priceBreakdown && (
                <div className="bg-dark-900/60 border border-white/[0.06] rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-400">Base ({selectedBooking.priceBreakdown.days} days)</span>
                    <span>₹{selectedBooking.priceBreakdown.base.toLocaleString()}</span>
                  </div>
                  {selectedBooking.priceBreakdown.fees?.map((f: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-dark-400">{f.name}</span>
                      <span>₹{Math.abs(f.amount).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-400">Tax</span>
                    <span>₹{selectedBooking.priceBreakdown.tax?.toLocaleString()}</span>
                  </div>
                  <hr className="border-white/[0.06]" />
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-white">₹{selectedBooking.priceBreakdown.total.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3 pt-2">
                {canCancel(selectedBooking.status) && (
                  <div className="space-y-2">
                    <label className="label">Cancel reason</label>
                    <input
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="input-field"
                      placeholder="Reason for cancellation"
                    />
                    <button onClick={handleCancel} disabled={actionLoading} className="btn-danger w-full">
                      {actionLoading ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  </div>
                )}

                {canDispute(selectedBooking.status) && !showReview && (
                  <div className="space-y-2">
                    <label className="label">Dispute reason</label>
                    <textarea
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      className="input-field min-h-[80px]"
                      placeholder="Describe your issue"
                    />
                    <button onClick={handleDispute} disabled={actionLoading || !disputeReason.trim()} className="btn-secondary w-full flex items-center justify-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Raise Dispute
                    </button>
                  </div>
                )}

                {canReview(selectedBooking.status) && (
                  <>
                    {!showReview ? (
                      <button onClick={() => setShowReview(true)} className="btn-secondary w-full flex items-center justify-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Leave a Review
                      </button>
                    ) : (
                      <div className="space-y-3 bg-dark-900/60 border border-white/[0.06] rounded-xl p-4">
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button key={i} onClick={() => setReviewRating(i + 1)}>
                              <Star className={`w-6 h-6 ${i < reviewRating ? 'text-yellow-500 fill-yellow-500' : 'text-dark-600'}`} />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="input-field min-h-[80px]"
                          placeholder="Share your experience..."
                        />
                        <div className="flex gap-2">
                          <button onClick={() => setShowReview(false)} className="btn-ghost flex-1">Cancel</button>
                          <button onClick={handleReview} disabled={actionLoading} className="btn-primary flex-1">
                            {actionLoading ? 'Submitting...' : 'Submit Review'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
