import React, { useEffect, useState } from 'react';
import { vehiclesAPI, bookingsAPI, ownerAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import StatusBadge from '../components/StatusBadge';
import { BookingRowSkeleton, VehicleCardSkeleton } from '../components/Skeletons';
import { EmptyState, ErrorState } from '../components/States';
import ScrollReveal from '../components/ScrollReveal';
import SpeedometerGauge from '../components/SpeedometerGauge';
import AnimatedTabs from '../components/AnimatedTabs';
import {
  Plus, Car, Calendar, DollarSign, Edit, Trash2, X, Check, Upload, Eye,
  ChevronRight, Image as ImageIcon, MapPin, Users, Fuel, Settings2,
  TrendingUp, BarChart2, Target, Percent,
} from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { customToast } from '../components/CustomToast';
import type { Vehicle, Booking, OwnerAnalytics } from '../types';

type Tab = 'vehicles' | 'bookings' | 'analytics';

export default function OwnerDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('vehicles');

  // Vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState('');

  // Bookings for owner's vehicles
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Vehicle form
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    seats: 5,
    transmission: 'auto' as 'auto' | 'manual',
    fuel: 'petrol',
    year: new Date().getFullYear(),
    baseRate: 2000,
    weekendRate: 2500,
    cleaningFee: 300,
    securityDeposit: 5000,
  });

  // Analytics
  const [analytics, setAnalytics] = useState<OwnerAnalytics | null>(null);
  const [analyticsRange, setAnalyticsRange] = useState('monthly');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const loadAnalytics = async (range = analyticsRange) => {
    setAnalyticsLoading(true);
    try {
      const res = await ownerAPI.analytics(range);
      setAnalytics(res.data);
    } catch {
      customToast.error('Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Image upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const loadVehicles = async () => {
    setVehiclesLoading(true);
    try {
      const res = await vehiclesAPI.search({ ownerId: user?._id, limit: 100 });
      setVehicles(res.data.items || res.data);
    } catch (err: any) {
      setVehiclesError(err?.response?.data?.detail || 'Failed to load vehicles');
    } finally {
      setVehiclesLoading(false);
    }
  };

  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await bookingsAPI.list({ page: 1, limit: 100 });
      setBookings(res.data.items || res.data);
    } catch (err: any) {
      customToast.error('Failed to load bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
    loadBookings();
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') loadAnalytics(analyticsRange);
  }, [activeTab, analyticsRange]);

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      location: '',
      seats: 5,
      transmission: 'auto',
      fuel: 'petrol',
      year: new Date().getFullYear(),
      baseRate: 2000,
      weekendRate: 2500,
      cleaningFee: 300,
      securityDeposit: 5000,
    });
    setImageFiles([]);
    setEditingVehicle(null);
    setShowForm(false);
  };

  const openEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setForm({
      title: v.title,
      description: v.description || '',
      location: v.location || '',
      seats: v.specs.seats,
      transmission: v.specs.transmission,
      fuel: v.specs.fuel,
      year: v.specs.year || new Date().getFullYear(),
      baseRate: v.pricing.baseRate,
      weekendRate: v.pricing.weekendRate || 0,
      cleaningFee: v.pricing.cleaningFee || 0,
      securityDeposit: v.pricing.securityDeposit || 0,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const body = {
        title: form.title,
        description: form.description,
        location: form.location,
        specs: {
          seats: form.seats,
          transmission: form.transmission,
          fuel: form.fuel,
          year: form.year,
        },
        pricing: {
          baseRate: form.baseRate,
          weekendRate: form.weekendRate || undefined,
          cleaningFee: form.cleaningFee || undefined,
          securityDeposit: form.securityDeposit || undefined,
        },
      };
      let vehicleId: string;
      if (editingVehicle) {
        await vehiclesAPI.update(editingVehicle._id, body);
        vehicleId = editingVehicle._id;
        customToast.success('Vehicle updated!');
      } else {
        const res = await vehiclesAPI.create(body);
        vehicleId = res.data._id || res.data.id;
        customToast.success('Vehicle created!');
      }

      // Upload images if any
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((f) => formData.append('files', f));
        await vehiclesAPI.uploadImages(vehicleId, formData);
        customToast.success('Images uploaded!');
      }

      resetForm();
      loadVehicles();
    } catch (err: any) {
      customToast.error(err?.response?.data?.detail || 'Save failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm('Delete this vehicle? This cannot be undone.')) return;
    try {
      await vehiclesAPI.delete(vehicleId);
      customToast.success('Vehicle deleted');
      loadVehicles();
    } catch (err: any) {
      customToast.error(err?.response?.data?.detail || 'Delete failed');
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await bookingsAPI.confirm(bookingId);
      customToast.booking('Booking confirmed');
      loadBookings();
    } catch (err: any) {
      customToast.error(err?.response?.data?.detail || 'Confirm failed');
    }
  };

  // Stats
  const totalRevenue = bookings
    .filter((b) => ['completed', 'active', 'confirmed'].includes(b.status))
    .reduce((acc, b) => acc + (b.priceBreakdown?.total || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Owner Dashboard</h1>
          <p className="text-dark-400 mt-1">Manage your fleet & bookings</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {/* Stats — speedometer gauges */}
      <ScrollReveal>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 flex flex-col items-center">
            <SpeedometerGauge value={vehicles.length} max={Math.max(vehicles.length, 20)} label="Vehicles" displayValue={String(vehicles.length)} color="#00d4ff" glowColor="#00d4ff" size={110} />
          </div>
          <div className="card p-4 flex flex-col items-center">
            <SpeedometerGauge value={bookings.filter((b) => b.status === 'active').length} max={Math.max(bookings.length, 10)} label="Active" displayValue={String(bookings.filter((b) => b.status === 'active').length)} color="#22c55e" glowColor="#22c55e" size={110} />
          </div>
          <div className="card p-4 flex flex-col items-center">
            <SpeedometerGauge value={bookings.filter((b) => ['pending', 'held'].includes(b.status)).length} max={Math.max(bookings.length, 10)} label="Pending" displayValue={String(bookings.filter((b) => ['pending', 'held'].includes(b.status)).length)} color="#eab308" glowColor="#eab308" size={110} />
          </div>
          <div className="card p-4 flex flex-col items-center">
            <SpeedometerGauge value={totalRevenue} max={Math.max(totalRevenue, 100000)} label="Revenue" displayValue={`₹${(totalRevenue / 1000).toFixed(0)}k`} color="#a855f7" glowColor="#a855f7" size={110} />
          </div>
        </div>
      </ScrollReveal>

      {/* Tabs */}
      <AnimatedTabs
        tabs={[
          { key: 'vehicles', label: 'My Vehicles' },
          { key: 'bookings', label: 'Bookings' },
          { key: 'analytics', label: '📊 Analytics' },
        ]}
        activeTab={activeTab}
        onTabChange={(key) => setActiveTab(key as Tab)}
      />
      <div className="mb-6" />

      {/* Vehicles Tab */}
      {activeTab === 'vehicles' && (
        <>
          {vehiclesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
            </div>
          ) : vehiclesError ? (
            <ErrorState message={vehiclesError} onRetry={loadVehicles} />
          ) : vehicles.length === 0 ? (
            <EmptyState title="No vehicles yet" description="Add your first vehicle to start earning." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <div key={v._id} className="card overflow-hidden">
                  <div className="h-40 bg-dark-800 relative">
                    {v.images?.[0] ? (
                      <img src={v.images[0].url} alt={v.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Car className="w-8 h-8 text-dark-500" /></div>
                    )}
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={v.status} />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white">{v.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-dark-400">
                      {v.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{v.location}</span>}
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{v.specs.seats}</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-bold text-white">₹{v.pricing.baseRate.toLocaleString()}<span className="text-xs text-dark-400 font-normal">/day</span></span>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(v)} className="p-2 text-dark-400 hover:text-primary-500 transition-colors" aria-label="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(v._id)} className="p-2 text-dark-400 hover:text-red-500 transition-colors" aria-label="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <>
          {bookingsLoading ? (
            <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <BookingRowSkeleton key={i} />)}</div>
          ) : bookings.length === 0 ? (
            <EmptyState title="No bookings yet" description="Bookings for your vehicles will appear here." />
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b._id} className="card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-white text-sm">{b.vehicle?.title || 'Vehicle'}</h4>
                    <p className="text-xs text-dark-400 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(b.startDate), 'MMM d')} − {format(new Date(b.endDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={b.status} />
                    <span className="text-sm font-bold">₹{b.priceBreakdown?.total?.toLocaleString() || '—'}</span>
                    {['pending', 'held'].includes(b.status) && (
                      <button onClick={() => handleConfirmBooking(b._id)} className="btn-primary text-xs py-1.5 px-3">
                        Confirm
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Range selector */}
          <div className="flex gap-2">
            {['weekly', 'monthly', 'yearly'].map(r => (
              <button key={r} onClick={() => setAnalyticsRange(r)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${analyticsRange === r ? 'bg-primary-600/20 border-primary-500 text-primary-400' : 'bg-dark-800 border-dark-700 text-dark-400'}`}>{r}</button>
            ))}
          </div>

          {analyticsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-dark-800 rounded-2xl animate-pulse" />)}</div>
          ) : analytics ? (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card p-4"><p className="text-xs text-dark-400 mb-1">Earnings (after commission)</p><p className="text-2xl font-bold text-dark-100">₹{analytics.ownerEarnings?.toLocaleString() ?? 0}</p></div>
                <div className="card p-4"><p className="text-xs text-dark-400 mb-1">Occupancy Rate</p><p className="text-2xl font-bold text-green-400">{analytics.occupancyRate ?? 0}%</p></div>
                <div className="card p-4"><p className="text-xs text-dark-400 mb-1">Cancellation Rate</p><p className="text-2xl font-bold text-red-400">{analytics.cancellationRate ?? 0}%</p></div>
                <div className="card p-4"><p className="text-xs text-dark-400 mb-1">Monthly Projection</p><p className="text-2xl font-bold text-primary-400">₹{analytics.monthlyProjection?.toLocaleString() ?? 0}</p></div>
              </div>

              {/* Revenue Chart */}
              {analytics.monthlyTrend?.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-semibold text-dark-200 mb-4">Revenue Trend</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={analytics.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} labelStyle={{ color: '#94a3b8' }} />
                      <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Occupancy Donut */}
              <div className="card p-5 flex items-center gap-8">
                <div className="flex-shrink-0">
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie data={[{ value: analytics.occupancyRate ?? 0 }, { value: 100 - (analytics.occupancyRate ?? 0) }]} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" startAngle={90} endAngle={-270}>
                        <Cell fill="#6366f1" />
                        <Cell fill="#1e293b" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p className="text-4xl font-bold text-dark-100">{analytics.occupancyRate ?? 0}%</p>
                  <p className="text-dark-400 mt-1">Fleet Occupancy</p>
                  <p className="text-xs text-dark-500 mt-2">Higher occupancy = more earnings. Target {'>'} 70%</p>
                </div>
              </div>
            </>
          ) : (
            <EmptyState title="No analytics data" description="Analytics will appear once you have bookings." />
          )}
        </div>
      )}

      {/* Vehicle Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={resetForm}>
          <div
            className="bg-dark-800/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
              <h2 className="text-lg font-bold text-white">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h2>
              <button onClick={resetForm} className="text-dark-300 hover:text-dark-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Vehicle Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="input-field"
                    required
                    placeholder="e.g. Honda City 2023"
                  />
                </div>
                <div>
                  <label className="label">Location *</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    className="input-field"
                    required
                    placeholder="e.g. Mumbai"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="label">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="input-field min-h-[80px]"
                  placeholder="Describe your vehicle..."
                />
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="label">Seats</label>
                  <select value={form.seats} onChange={(e) => setForm((p) => ({ ...p, seats: +e.target.value }))} className="input-field">
                    {[2, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Transmission</label>
                  <select value={form.transmission} onChange={(e) => setForm((p) => ({ ...p, transmission: e.target.value as any }))} className="input-field">
                    <option value="auto">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="label">Fuel</label>
                  <select value={form.fuel} onChange={(e) => setForm((p) => ({ ...p, fuel: e.target.value }))} className="input-field">
                    {['petrol', 'diesel', 'electric', 'hybrid', 'cng'].map((f) => (
                      <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Year</label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm((p) => ({ ...p, year: +e.target.value }))}
                    className="input-field"
                    min={2000}
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="label">Base Rate ₹/day *</label>
                  <input
                    type="number"
                    value={form.baseRate}
                    onChange={(e) => setForm((p) => ({ ...p, baseRate: +e.target.value }))}
                    className="input-field"
                    required
                    min={100}
                  />
                </div>
                <div>
                  <label className="label">Weekend ₹/day</label>
                  <input
                    type="number"
                    value={form.weekendRate}
                    onChange={(e) => setForm((p) => ({ ...p, weekendRate: +e.target.value }))}
                    className="input-field"
                    min={0}
                  />
                </div>
                <div>
                  <label className="label">Cleaning Fee ₹</label>
                  <input
                    type="number"
                    value={form.cleaningFee}
                    onChange={(e) => setForm((p) => ({ ...p, cleaningFee: +e.target.value }))}
                    className="input-field"
                    min={0}
                  />
                </div>
                <div>
                  <label className="label">Security Deposit ₹</label>
                  <input
                    type="number"
                    value={form.securityDeposit}
                    onChange={(e) => setForm((p) => ({ ...p, securityDeposit: +e.target.value }))}
                    className="input-field"
                    min={0}
                  />
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="label">Images</label>
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-white/[0.1] rounded-xl p-6 cursor-pointer hover:border-primary-500/40 transition-colors">
                  <Upload className="w-5 h-5 text-dark-400" />
                  <span className="text-sm text-dark-400">
                    {imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : 'Click to upload images'}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                  />
                </label>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={formLoading} className="btn-primary flex-1">
                  {formLoading ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Create Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
