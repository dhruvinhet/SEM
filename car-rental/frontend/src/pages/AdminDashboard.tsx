import React, { useEffect, useState } from 'react';
import { adminAPI } from '../lib/api';
import StatusBadge from '../components/StatusBadge';
import { StatCardSkeleton, BookingRowSkeleton } from '../components/Skeletons';
import { ErrorState, EmptyState } from '../components/States';
import {
  BarChart3, Users, Car, DollarSign, Download, Search, Eye,
  CheckCircle, XCircle, Calendar, Shield, FileText, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';

type Tab = 'analytics' | 'bookings' | 'vehicles' | 'users' | 'audit';

const COLORS = ['#FF6B35', '#2563eb', '#16a34a', '#eab308', '#8b5cf6', '#ef4444', '#6b7280'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('analytics');

  // Analytics
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState('');

  // Bookings
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsTotal, setBookingsTotal] = useState(0);

  // Vehicles (moderation)
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);

  // Users
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Audit logs
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === 'bookings') loadBookings();
    if (activeTab === 'vehicles') loadVehicles();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'audit') loadAuditLogs();
  }, [activeTab, bookingsPage]);

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await adminAPI.analytics();
      setAnalytics(res.data);
    } catch (err: any) {
      setAnalyticsError(err?.response?.data?.detail || 'Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await adminAPI.bookings({ page: bookingsPage, limit: 20 });
      setBookings(res.data.items || res.data);
      setBookingsTotal(res.data.total || 0);
    } catch { toast.error('Failed to load bookings'); }
    finally { setBookingsLoading(false); }
  };

  const loadVehicles = async () => {
    setVehiclesLoading(true);
    try {
      const res = await adminAPI.vehicles();
      setVehicles(res.data.items || res.data);
    } catch { toast.error('Failed to load vehicles'); }
    finally { setVehiclesLoading(false); }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await adminAPI.users();
      setUsers(res.data.items || res.data);
    } catch { toast.error('Failed to load users'); }
    finally { setUsersLoading(false); }
  };

  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const res = await adminAPI.auditLogs({ limit: 50 });
      setAuditLogs(res.data.items || res.data);
    } catch { toast.error('Failed to load audit logs'); }
    finally { setAuditLoading(false); }
  };

  const handleApprove = async (id: string) => {
    try {
      await adminAPI.approveVehicle(id);
      toast.success('Vehicle approved');
      loadVehicles();
    } catch (err: any) { toast.error(err?.response?.data?.detail || 'Failed'); }
  };

  const handleReject = async (id: string) => {
    try {
      await adminAPI.rejectVehicle(id, 'Rejected by admin');
      toast.success('Vehicle rejected');
      loadVehicles();
    } catch (err: any) { toast.error(err?.response?.data?.detail || 'Failed'); }
  };

  const handleExportCSV = async () => {
    try {
      const res = await adminAPI.exportBookingsCSV();
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV downloaded');
    } catch { toast.error('Export failed'); }
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'bookings', label: 'Bookings', icon: Calendar },
    { key: 'vehicles', label: 'Vehicles', icon: Car },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'audit', label: 'Audit Logs', icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-dark-700">Admin Dashboard</h1>
          <p className="text-dark-400 mt-1">Platform overview & management</p>
        </div>
        <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 mb-8">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              activeTab === key ? 'text-primary-600 border-primary-500' : 'text-dark-400 border-transparent hover:text-dark-600'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <>
          {analyticsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
            </div>
          ) : analyticsError ? (
            <ErrorState message={analyticsError} onRetry={loadAnalytics} />
          ) : analytics ? (
            <>
              {/* KPI cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Revenue', value: `₹${((analytics.totalRevenue || 0) / 1000).toFixed(0)}k`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
                  { label: 'Total Bookings', value: analytics.totalBookings || 0, icon: FileText, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Active Users', value: analytics.totalUsers || 0, icon: Users, color: 'bg-purple-50 text-purple-600' },
                  { label: 'Vehicles', value: analytics.totalVehicles || 0, icon: Car, color: 'bg-orange-50 text-orange-600' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="card p-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-dark-700">{value}</p>
                        <p className="text-xs text-dark-400">{label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue Trend */}
                <div className="card p-6">
                  <h3 className="font-semibold text-dark-700 mb-4">Revenue Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.revenueTrend || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#FF6B35" fill="#FF6B3520" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Booking Status Distribution */}
                <div className="card p-6">
                  <h3 className="font-semibold text-dark-700 mb-4">Booking Status</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.statusDistribution || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="count"
                          nameKey="status"
                          label={({ status, count }) => `${status}: ${count}`}
                        >
                          {(analytics.statusDistribution || []).map((_: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Vehicles */}
                <div className="card p-6 lg:col-span-2">
                  <h3 className="font-semibold text-dark-700 mb-4">Top Vehicles by Bookings</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(analytics.topVehicles || []).slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="title" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <Tooltip />
                        <Bar dataKey="bookings" fill="#FF6B35" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookingsLoading ? (
            Array.from({ length: 5 }).map((_, i) => <BookingRowSkeleton key={i} />)
          ) : bookings.length === 0 ? (
            <EmptyState title="No bookings" description="No bookings in the system." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-gray-50 text-dark-400">
                      <th className="px-4 py-3 rounded-l-xl">ID</th>
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3 rounded-r-xl">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{b._id?.slice(-8)}</td>
                        <td className="px-4 py-3 font-medium text-dark-700">{b.vehicleTitle || '—'}</td>
                        <td className="px-4 py-3 text-dark-400">
                          {format(new Date(b.startDate), 'MMM d')} − {format(new Date(b.endDate), 'MMM d')}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                        <td className="px-4 py-3 font-semibold">₹{b.priceBreakdown?.total?.toLocaleString() || '—'}</td>
                        <td className="px-4 py-3 text-dark-400">
                          {b.createdAt ? format(new Date(b.createdAt), 'MMM d, yyyy') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-dark-400">
                  Page {bookingsPage} • {bookingsTotal} total
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBookingsPage((p) => Math.max(1, p - 1))}
                    disabled={bookingsPage <= 1}
                    className="btn-ghost text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setBookingsPage((p) => p + 1)}
                    disabled={bookings.length < 20}
                    className="btn-ghost text-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Vehicles Moderation Tab */}
      {activeTab === 'vehicles' && (
        <div>
          {vehiclesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <BookingRowSkeleton key={i} />)}
            </div>
          ) : vehicles.length === 0 ? (
            <EmptyState title="No vehicles" description="No vehicles in the system." />
          ) : (
            <div className="space-y-3">
              {vehicles.map((v) => (
                <div key={v._id} className="card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {v.images?.[0] ? (
                        <img src={v.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Car className="w-5 h-5 text-gray-300" /></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-700 text-sm">{v.title}</h4>
                      <p className="text-xs text-dark-400">{v.location} • ₹{v.pricing?.baseRate?.toLocaleString()}/day</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={v.status} />
                    {v.status === 'pending_approval' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(v._id)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" aria-label="Approve">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleReject(v._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" aria-label="Reject">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          {usersLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <BookingRowSkeleton key={i} />)}
            </div>
          ) : users.length === 0 ? (
            <EmptyState title="No users" description="No users in the system." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left bg-gray-50 text-dark-400">
                    <th className="px-4 py-3 rounded-l-xl">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-dark-700">{u.name}</td>
                      <td className="px-4 py-3 text-dark-400">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`badge-${u.role === 'admin' ? 'green' : u.role === 'owner' ? 'blue' : 'gray'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-dark-400">
                        {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`w-2.5 h-2.5 rounded-full inline-block mr-1 ${u.isActive !== false ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-xs text-dark-400">{u.isActive !== false ? 'Active' : 'Inactive'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div>
          {auditLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => <BookingRowSkeleton key={i} />)}
            </div>
          ) : auditLogs.length === 0 ? (
            <EmptyState title="No audit logs" description="No audit activity recorded." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left bg-gray-50 text-dark-400">
                    <th className="px-4 py-3 rounded-l-xl">Action</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3 rounded-r-xl">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-dark-700">{log.action}</td>
                      <td className="px-4 py-3 text-dark-400">{log.actorEmail || log.actorId?.slice(-6) || '—'}</td>
                      <td className="px-4 py-3 text-dark-400 font-mono text-xs">{log.entityType}:{log.entityId?.slice(-6)}</td>
                      <td className="px-4 py-3 text-dark-400 text-xs max-w-[200px] truncate">
                        {log.details ? JSON.stringify(log.details) : '—'}
                      </td>
                      <td className="px-4 py-3 text-dark-400">
                        {log.createdAt ? format(new Date(log.createdAt), 'MMM d, HH:mm') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
