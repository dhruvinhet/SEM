import React, { useEffect, useState } from 'react';
import { adminAPI, announcementsAPI, verificationsAPI, couponsAPI } from '../lib/api';
import StatusBadge from '../components/StatusBadge';
import { StatCardSkeleton, BookingRowSkeleton } from '../components/Skeletons';
import { ErrorState, EmptyState } from '../components/States';
import ScrollReveal from '../components/ScrollReveal';
import SpeedometerGauge from '../components/SpeedometerGauge';
import AnimatedTabs from '../components/AnimatedTabs';
import {
  BarChart3, Users, Car, DollarSign, Download, Search, Eye,
  CheckCircle, XCircle, Calendar, Shield, FileText, ChevronLeft, ChevronRight,
  Settings, AlertTriangle, Megaphone, BanIcon, Ticket, TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { customToast } from '../components/CustomToast';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';

type Tab = 'analytics' | 'bookings' | 'vehicles' | 'users' | 'audit' | 'config' | 'blacklist' | 'disputes' | 'announcements';

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

  // Config
  const [configs, setConfigs] = useState<any[]>([]);
  const [configLoading, setConfigLoading] = useState(false);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [configVal, setConfigVal] = useState<string>('');

  // Blacklist
  const [blacklist, setBlacklist] = useState<any[]>([]);
  const [blacklistLoading, setBlacklistLoading] = useState(false);

  // Disputes
  const [disputes, setDisputes] = useState<any[]>([]);
  const [disputesLoading, setDisputesLoading] = useState(false);

  // Announcements
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: '', message: '', type: 'info', targetRole: 'all' });

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === 'bookings') loadBookings();
    if (activeTab === 'vehicles') loadVehicles();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'audit') loadAuditLogs();
    if (activeTab === 'config') loadConfig();
    if (activeTab === 'blacklist') loadBlacklist();
    if (activeTab === 'disputes') loadDisputes();
    if (activeTab === 'announcements') loadAnnouncements();
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
    } catch { customToast.error('Failed to load bookings'); }
    finally { setBookingsLoading(false); }
  };

  const loadVehicles = async () => {
    setVehiclesLoading(true);
    try {
      const res = await adminAPI.vehicles();
      setVehicles(res.data.items || res.data);
    } catch { customToast.error('Failed to load vehicles'); }
    finally { setVehiclesLoading(false); }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await adminAPI.users();
      setUsers(res.data.items || res.data);
    } catch { customToast.error('Failed to load users'); }
    finally { setUsersLoading(false); }
  };

  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const res = await adminAPI.auditLogs({ limit: 50 });
      setAuditLogs(res.data.items || res.data);
    } catch { customToast.error('Failed to load audit logs'); }
    finally { setAuditLoading(false); }
  };

  const loadConfig = async () => {
    setConfigLoading(true);
    try {
      const res = await adminAPI.config();
      setConfigs(res.data.items || []);
    } catch { customToast.error('Failed to load config'); }
    finally { setConfigLoading(false); }
  };

  const loadBlacklist = async () => {
    setBlacklistLoading(true);
    try {
      const res = await adminAPI.blacklist();
      setBlacklist(res.data.items || []);
    } catch { customToast.error('Failed to load blacklist'); }
    finally { setBlacklistLoading(false); }
  };

  const loadDisputes = async () => {
    setDisputesLoading(true);
    try {
      const res = await adminAPI.disputes();
      setDisputes(res.data.items || []);
    } catch { customToast.error('Failed to load disputes'); }
    finally { setDisputesLoading(false); }
  };

  const loadAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      const res = await announcementsAPI.list();
      setAnnouncements(res.data.items || res.data || []);
    } catch { customToast.error('Failed to load announcements'); }
    finally { setAnnouncementsLoading(false); }
  };

  const handleApprove = async (id: string) => {
    try {
      await adminAPI.approveVehicle(id);
      customToast.success('Vehicle approved');
      loadVehicles();
    } catch (err: any) { customToast.error(err?.response?.data?.detail || 'Failed'); }
  };

  const handleReject = async (id: string) => {
    try {
      await adminAPI.rejectVehicle(id, 'Rejected by admin');
      customToast.success('Vehicle rejected');
      loadVehicles();
    } catch (err: any) { customToast.error(err?.response?.data?.detail || 'Failed'); }
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
      customToast.success('CSV downloaded');
    } catch { customToast.error('Export failed'); }
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'bookings', label: 'Bookings', icon: Calendar },
    { key: 'vehicles', label: 'Vehicles', icon: Car },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'audit', label: 'Audit Logs', icon: Shield },
    { key: 'config', label: 'Config', icon: Settings },
    { key: 'blacklist', label: 'Blacklist', icon: BanIcon },
    { key: 'disputes', label: 'Disputes', icon: AlertTriangle },
    { key: 'announcements', label: 'Announcements', icon: Megaphone },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Admin Dashboard</h1>
          <p className="text-dark-400 mt-1">Platform overview & management</p>
        </div>
        <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Tabs */}
      <AnimatedTabs
        tabs={tabs.map(({ key, label, icon }) => ({ key, label, icon }))}
        activeTab={activeTab}
        onTabChange={(key) => setActiveTab(key as Tab)}
      />
      <div className="mb-8" />

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
              {/* KPI cards — speedometer gauges */}
              <ScrollReveal>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <div className="card p-5 flex flex-col items-center">
                    <SpeedometerGauge value={analytics.totalRevenue || 0} max={Math.max(analytics.totalRevenue || 0, 500000)} label="Revenue" displayValue={`₹${((analytics.totalRevenue || 0) / 1000).toFixed(0)}k`} color="#22c55e" glowColor="#22c55e" size={110} />
                  </div>
                  <div className="card p-5 flex flex-col items-center">
                    <SpeedometerGauge value={analytics.totalBookings || 0} max={Math.max(analytics.totalBookings || 0, 100)} label="Bookings" displayValue={String(analytics.totalBookings || 0)} color="#00d4ff" glowColor="#00d4ff" size={110} />
                  </div>
                  <div className="card p-5 flex flex-col items-center">
                    <SpeedometerGauge value={analytics.totalUsers || 0} max={Math.max(analytics.totalUsers || 0, 100)} label="Users" displayValue={String(analytics.totalUsers || 0)} color="#a855f7" glowColor="#a855f7" size={110} />
                  </div>
                  <div className="card p-5 flex flex-col items-center">
                    <SpeedometerGauge value={analytics.totalVehicles || 0} max={Math.max(analytics.totalVehicles || 0, 50)} label="Vehicles" displayValue={String(analytics.totalVehicles || 0)} color="#FF4433" glowColor="#FF4433" size={110} />
                  </div>
                </div>
              </ScrollReveal>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue Trend */}
                <div className="card p-6">
                  <h3 className="font-semibold text-white mb-4">Revenue Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.revenueTrend || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
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
                  <h3 className="font-semibold text-white mb-4">Booking Status</h3>
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
                  <h3 className="font-semibold text-white mb-4">Top Vehicles by Bookings</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(analytics.topVehicles || []).slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="title" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <Tooltip />
                        <Bar dataKey="bookings" fill="#FF6B35" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Extended Platform Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* GMV + Commission */}
                <div className="card p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Platform Revenue</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">GMV (Gross Merch Value)</span>
                      <span className="font-bold text-green-400">₹{((analytics.gmv || 0) / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">Commission Revenue</span>
                      <span className="font-bold text-primary-400">₹{((analytics.commissionRevenue || 0) / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">Cancellation Rate</span>
                      <span className={`font-bold ${(analytics.cancellationRate || 0) > 15 ? 'text-red-400' : 'text-green-400'}`}>{(analytics.cancellationRate || 0).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Fraud Alerts */}
                <div className="card p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" /> Fraud Alerts</h3>
                  {(analytics.fraudAlerts || []).length === 0 ? (
                    <p className="text-sm text-green-400">No fraud alerts detected</p>
                  ) : (
                    <div className="space-y-2">
                      {(analytics.fraudAlerts || []).slice(0, 5).map((alert: any, i: number) => (
                        <div key={i} className="text-xs bg-red-500/10 text-red-400 rounded-lg px-3 py-2">
                          {alert.type}: {alert.message || alert.userId?.slice(-6)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Cities + User Growth */}
                <div className="card p-6">
                  <h3 className="font-semibold text-white mb-4">Top Cities</h3>
                  <div className="space-y-2">
                    {(analytics.topCities || []).slice(0, 5).map((city: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-dark-400">{city.city}</span>
                        <span className="font-semibold text-white">{city.bookings} bookings</span>
                      </div>
                    ))}
                    {(analytics.topCities || []).length === 0 && <p className="text-sm text-dark-400">No data</p>}
                  </div>
                  <div className="mt-4 border-t border-white/[0.06] pt-3">
                    <p className="text-xs text-dark-400 mb-1">New Users (30d)</p>
                    <p className="text-2xl font-bold text-primary-400">{(analytics.userGrowth || []).reduce((s: number, g: any) => s + (g.newUsers || 0), 0)}</p>
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
                    <tr className="text-left bg-dark-800/60 text-dark-400">
                      <th className="px-4 py-3 rounded-l-xl">ID</th>
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3 rounded-r-xl">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{b._id?.slice(-8)}</td>
                        <td className="px-4 py-3 font-medium text-white">{b.vehicleTitle || '—'}</td>
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
                    <div className="w-16 h-12 rounded-xl bg-dark-800 overflow-hidden flex-shrink-0">
                      {v.images?.[0] ? (
                        <img src={v.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Car className="w-5 h-5 text-dark-500" /></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{v.title}</h4>
                      <p className="text-xs text-dark-400">{v.location} • ₹{v.pricing?.baseRate?.toLocaleString()}/day</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={v.status} />
                    {v.status === 'pending_approval' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(v._id)} className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors" aria-label="Approve">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleReject(v._id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors" aria-label="Reject">
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
                  <tr className="text-left bg-dark-800/60 text-dark-400">
                    <th className="px-4 py-3 rounded-l-xl">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{u.name}</td>
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
                        <span className={`w-2.5 h-2.5 rounded-full inline-block mr-1 ${u.isActive !== false ? 'bg-green-500' : 'bg-dark-600'}`} />
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
                  <tr className="text-left bg-dark-800/60 text-dark-400">
                    <th className="px-4 py-3 rounded-l-xl">Action</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3 rounded-r-xl">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{log.action}</td>
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

      {/* Config Tab */}
      {activeTab === 'config' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-dark-200 mb-4">Platform Configuration</h2>
          {configLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-dark-800 rounded-xl animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {configs.map(cfg => (
                <div key={cfg._id} className="flex items-center justify-between p-4 bg-dark-800 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-dark-200">{cfg.key}</p>
                    {cfg.description && <p className="text-xs text-dark-400 mt-0.5">{cfg.description}</p>}
                  </div>
                  {editingConfig === cfg.key ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={configVal}
                        onChange={e => setConfigVal(e.target.value)}
                        className="w-24 text-sm bg-dark-700 border border-dark-600 rounded-lg px-2 py-1 text-dark-100"
                      />
                      <button onClick={async () => {
                        try {
                          await adminAPI.updateConfig(cfg.key, isNaN(Number(configVal)) ? configVal : Number(configVal), cfg.description);
                          customToast.success('Config updated');
                          setEditingConfig(null);
                          loadConfig();
                        } catch { customToast.error('Update failed'); }
                      }} className="text-xs text-green-400 hover:text-green-300">Save</button>
                      <button onClick={() => setEditingConfig(null)} className="text-xs text-dark-400">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-primary-400 font-semibold">{String(cfg.value)}</span>
                      <button onClick={() => { setEditingConfig(cfg.key); setConfigVal(String(cfg.value)); }} className="text-xs text-dark-400 hover:text-dark-200">Edit</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Blacklist Tab */}
      {activeTab === 'blacklist' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-dark-200 mb-4">Blacklisted Users</h2>
          {blacklistLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-dark-800 rounded-xl animate-pulse" />)}</div>
          ) : blacklist.length === 0 ? (
            <EmptyState title="No blacklisted users" description="Users flagged for suspicious activity appear here." />
          ) : (
            <div className="space-y-3">
              {blacklist.map(bl => (
                <div key={bl._id} className="flex items-center justify-between p-4 bg-dark-800 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-dark-100">{bl.user?.name || bl.userId}</p>
                    <p className="text-xs text-dark-400">{bl.user?.email} · Reason: {bl.reason}</p>
                  </div>
                  <button onClick={async () => {
                    try {
                      await adminAPI.unblacklistUser(bl.userId);
                      customToast.success('User unblacklisted');
                      loadBlacklist();
                    } catch { customToast.error('Failed'); }
                  }} className="text-xs text-red-400 hover:text-red-300 border border-red-800 px-3 py-1.5 rounded-lg">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Quick blacklist form */}
          <div className="mt-6 border-t border-dark-700 pt-5">
            <h3 className="text-sm font-medium text-dark-300 mb-3">Blacklist a User</h3>
            <div className="flex gap-3">
              <input id="bl-uid" type="text" placeholder="User ID" className="flex-1 text-sm bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-dark-100" />
              <input id="bl-reason" type="text" placeholder="Reason" className="flex-1 text-sm bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-dark-100" />
              <button onClick={async () => {
                const uid = (document.getElementById('bl-uid') as HTMLInputElement)?.value;
                const reason = (document.getElementById('bl-reason') as HTMLInputElement)?.value;
                if (!uid || !reason) { customToast.error('Fill all fields'); return; }
                try {
                  await adminAPI.blacklistUser(uid, reason);
                  customToast.success('User blacklisted');
                  loadBlacklist();
                } catch { customToast.error('Failed'); }
              }} className="text-sm bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-xl">Blacklist</button>
            </div>
          </div>
        </div>
      )}

      {/* Disputes Tab */}
      {activeTab === 'disputes' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-dark-200 mb-4">Disputed Bookings</h2>
          {disputesLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-dark-800 rounded-xl animate-pulse" />)}</div>
          ) : disputes.length === 0 ? (
            <EmptyState title="No disputes" description="All disputes resolved!" />
          ) : (
            <div className="space-y-3">
              {disputes.map(d => (
                <div key={d._id} className="p-4 bg-dark-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-dark-100">Booking #{d._id?.slice(-6)}</p>
                      <p className="text-xs text-dark-400 mt-1">User: {d.userId} · Owner: {d.ownerId}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={async () => {
                        try {
                          await fetch(`/api/bookings/${d._id}/resolve`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` }, body: JSON.stringify({ resolution: 'refund', notes: 'Admin resolved: refund' }) });
                          customToast.success('Resolved with refund');
                          loadDisputes();
                        } catch { customToast.error('Failed'); }
                      }} className="text-xs text-green-400 border border-green-800 px-3 py-1.5 rounded-lg">Refund</button>
                      <button onClick={async () => {
                        try {
                          await fetch(`/api/bookings/${d._id}/resolve`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` }, body: JSON.stringify({ resolution: 'complete', notes: 'Admin resolved: no refund' }) });
                          customToast.success('Resolved without refund');
                          loadDisputes();
                        } catch { customToast.error('Failed'); }
                      }} className="text-xs text-yellow-400 border border-yellow-800 px-3 py-1.5 rounded-lg">No Refund</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-dark-200">Announcements & Broadcasts</h2>
          {/* Create form */}
          <div className="bg-dark-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-medium text-dark-300">Create Announcement</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" placeholder="Title" value={newAnn.title} onChange={e => setNewAnn(p => ({ ...p, title: e.target.value }))} className="text-sm bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 text-dark-100" />
              <select value={newAnn.type} onChange={e => setNewAnn(p => ({ ...p, type: e.target.value }))} className="text-sm bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 text-dark-100">
                {['info', 'warning', 'success', 'error'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <textarea placeholder="Message" value={newAnn.message} onChange={e => setNewAnn(p => ({ ...p, message: e.target.value }))} className="sm:col-span-2 text-sm bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 text-dark-100 min-h-[80px]" />
              <select value={newAnn.targetRole} onChange={e => setNewAnn(p => ({ ...p, targetRole: e.target.value }))} className="text-sm bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 text-dark-100">
                {['all', 'user', 'owner', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <button onClick={async () => {
                if (!newAnn.title || !newAnn.message) { customToast.error('Fill title and message'); return; }
                try {
                  await announcementsAPI.create({ ...newAnn, broadcast: true });
                  customToast.success('Announcement created & broadcast!');
                  setNewAnn({ title: '', message: '', type: 'info', targetRole: 'all' });
                  loadAnnouncements();
                } catch { customToast.error('Failed'); }
              }} className="text-sm bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl">
                Create & Broadcast
              </button>
            </div>
          </div>

          {/* List */}
          {announcementsLoading ? (
            <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-16 bg-dark-800 rounded-xl animate-pulse" />)}</div>
          ) : announcements.length === 0 ? (
            <EmptyState title="No announcements" description="Create announcements to broadcast to users." />
          ) : (
            <div className="space-y-3">
              {announcements.map(ann => (
                <div key={ann._id} className={`flex items-start justify-between p-4 rounded-xl border ${ann.type === 'warning' ? 'border-yellow-800 bg-yellow-950/20' : ann.type === 'error' ? 'border-red-800 bg-red-950/20' : ann.type === 'success' ? 'border-green-800 bg-green-950/20' : 'border-blue-800 bg-blue-950/20'}`}>
                  <div>
                    <p className="text-sm font-semibold text-dark-100">{ann.title}</p>
                    <p className="text-xs text-dark-300 mt-0.5">{ann.message}</p>
                    <p className="text-xs text-dark-500 mt-1">Target: {ann.targetRole} · {ann.createdAt ? format(new Date(ann.createdAt), 'MMM d') : ''}</p>
                  </div>
                  <button onClick={async () => {
                    try {
                      await announcementsAPI.delete(ann._id);
                      customToast.success('Deleted');
                      loadAnnouncements();
                    } catch { customToast.error('Failed'); }
                  }} className="text-dark-500 hover:text-red-400 text-xs">Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

