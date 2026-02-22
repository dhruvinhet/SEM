import React, { useEffect, useState, useMemo } from 'react';
import { adminAPI, announcementsAPI, couponsAPI } from '../lib/api';
import StatusBadge from '../components/StatusBadge';
import { StatCardSkeleton, BookingRowSkeleton } from '../components/Skeletons';
import { ErrorState, EmptyState } from '../components/States';
import {
  BarChart3, Users, Car, DollarSign, Download, Search, Eye,
  CheckCircle, XCircle, Calendar, Shield, FileText, ChevronLeft, ChevronRight,
  Settings, AlertTriangle, Megaphone, BanIcon, Ticket, TrendingUp,
  ArrowUpRight, ArrowDownRight, Activity, Clock, RefreshCw,
  MoreVertical, Filter, Hash, CircleDot, ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { customToast } from '../components/CustomToast';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';

type Tab = 'analytics' | 'bookings' | 'vehicles' | 'users' | 'audit' | 'config' | 'blacklist' | 'disputes' | 'announcements';

const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

/* ─────────────── Sidebar Nav Item ─────────────── */
function SideNavItem({ icon: Icon, label, active, onClick, badge }: {
  icon: React.ElementType; label: string; active: boolean; onClick: () => void; badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors relative group ${
        active
          ? 'bg-white/[0.08] text-white'
          : 'text-[#8a8f98] hover:bg-white/[0.04] hover:text-[#c9cdd4]'
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto text-[10px] bg-red-500/20 text-red-400 rounded-full px-1.5 py-0.5 min-w-[20px] text-center font-semibold">
          {badge}
        </span>
      )}
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-indigo-500 rounded-r-full" />}
    </button>
  );
}

/* ─────────────── Stat Card ─────────────── */
function StatCard({ label, value, subValue, icon: Icon, trend, trendUp, color }: {
  label: string; value: string; subValue?: string; icon: React.ElementType;
  trend?: string; trendUp?: boolean; color: string;
}) {
  const colorMap: Record<string, { text: string; iconBg: string }> = {
    green:  { text: 'text-emerald-400', iconBg: 'bg-emerald-500/10' },
    blue:   { text: 'text-blue-400',    iconBg: 'bg-blue-500/10' },
    purple: { text: 'text-violet-400',  iconBg: 'bg-violet-500/10' },
    orange: { text: 'text-amber-400',   iconBg: 'bg-amber-500/10' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-[#16171f] border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between min-h-[120px]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-medium text-[#8a8f98] uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${c.iconBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-semibold text-white tracking-tight">{value}</p>
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <span className={`flex items-center gap-0.5 text-[11px] font-medium ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {trend}
            </span>
          )}
          {subValue && <span className="text-[11px] text-[#5a5e68]">{subValue}</span>}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Chart Tooltip ─────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e2028] border border-white/[0.08] rounded-lg px-3 py-2 shadow-xl text-left">
      <p className="text-[11px] text-[#8a8f98] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[12px] font-medium" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

/* ─────────────── Section Header ─────────────── */
function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-[15px] font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-[12px] text-[#6b7280] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ─────────────── Table Shell ─────────────── */
function TableShell({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="bg-[#16171f] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState('');

  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsTotal, setBookingsTotal] = useState(0);
  const [bookingsSearch, setBookingsSearch] = useState('');

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const [configs, setConfigs] = useState<any[]>([]);
  const [configLoading, setConfigLoading] = useState(false);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [configVal, setConfigVal] = useState<string>('');

  const [blacklist, setBlacklist] = useState<any[]>([]);
  const [blacklistLoading, setBlacklistLoading] = useState(false);

  const [disputes, setDisputes] = useState<any[]>([]);
  const [disputesLoading, setDisputesLoading] = useState(false);

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: '', message: '', type: 'info', targetRole: 'all' });

  /* ── Data loaders ──────────────────────── */
  useEffect(() => { loadAnalytics(); }, []);

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
    try { const res = await adminAPI.analytics(); setAnalytics(res.data); }
    catch (err: any) { setAnalyticsError(err?.response?.data?.detail || 'Failed to load analytics'); }
    finally { setAnalyticsLoading(false); }
  };
  const loadBookings = async () => {
    setBookingsLoading(true);
    try { const res = await adminAPI.bookings({ page: bookingsPage, limit: 20 }); setBookings(res.data.items || res.data); setBookingsTotal(res.data.total || 0); }
    catch { customToast.error('Failed to load bookings'); }
    finally { setBookingsLoading(false); }
  };
  const loadVehicles = async () => {
    setVehiclesLoading(true);
    try { const res = await adminAPI.vehicles(); setVehicles(res.data.items || res.data); }
    catch { customToast.error('Failed to load vehicles'); }
    finally { setVehiclesLoading(false); }
  };
  const loadUsers = async () => {
    setUsersLoading(true);
    try { const res = await adminAPI.users(); setUsers(res.data.items || res.data); }
    catch { customToast.error('Failed to load users'); }
    finally { setUsersLoading(false); }
  };
  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try { const res = await adminAPI.auditLogs({ limit: 50 }); setAuditLogs(res.data.items || res.data); }
    catch { customToast.error('Failed to load audit logs'); }
    finally { setAuditLoading(false); }
  };
  const loadConfig = async () => {
    setConfigLoading(true);
    try { const res = await adminAPI.config(); setConfigs(res.data.items || []); }
    catch { customToast.error('Failed to load config'); }
    finally { setConfigLoading(false); }
  };
  const loadBlacklist = async () => {
    setBlacklistLoading(true);
    try { const res = await adminAPI.blacklist(); setBlacklist(res.data.items || []); }
    catch { customToast.error('Failed to load blacklist'); }
    finally { setBlacklistLoading(false); }
  };
  const loadDisputes = async () => {
    setDisputesLoading(true);
    try { const res = await adminAPI.disputes(); setDisputes(res.data.items || []); }
    catch { customToast.error('Failed to load disputes'); }
    finally { setDisputesLoading(false); }
  };
  const loadAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try { const res = await announcementsAPI.list(); setAnnouncements(res.data.items || res.data || []); }
    catch { customToast.error('Failed to load announcements'); }
    finally { setAnnouncementsLoading(false); }
  };

  /* ── Actions ───────────────────────────── */
  const handleApprove = async (id: string) => {
    try { await adminAPI.approveVehicle(id); customToast.success('Vehicle approved'); loadVehicles(); }
    catch (err: any) { customToast.error(err?.response?.data?.detail || 'Failed'); }
  };
  const handleReject = async (id: string) => {
    try { await adminAPI.rejectVehicle(id, 'Rejected by admin'); customToast.success('Vehicle rejected'); loadVehicles(); }
    catch (err: any) { customToast.error(err?.response?.data?.detail || 'Failed'); }
  };
  const handleExportCSV = async () => {
    try {
      const res = await adminAPI.exportBookingsCSV();
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `bookings_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click(); URL.revokeObjectURL(url); customToast.success('CSV exported');
    } catch { customToast.error('Export failed'); }
  };

  /* ── Filters ───────────────────────────── */
  const filteredBookings = useMemo(() => {
    if (!bookingsSearch) return bookings;
    const q = bookingsSearch.toLowerCase();
    return bookings.filter(b => b._id?.toLowerCase().includes(q) || b.vehicleTitle?.toLowerCase().includes(q) || b.status?.toLowerCase().includes(q));
  }, [bookings, bookingsSearch]);

  const filteredUsers = useMemo(() => {
    if (!usersSearch) return users;
    const q = usersSearch.toLowerCase();
    return users.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q));
  }, [users, usersSearch]);

  /* ── Nav config ────────────────────────── */
  const navItems: { key: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: 'analytics', label: 'Overview', icon: BarChart3 },
    { key: 'bookings', label: 'Bookings', icon: Calendar, badge: bookingsTotal || undefined },
    { key: 'vehicles', label: 'Vehicles', icon: Car },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'disputes', label: 'Disputes', icon: AlertTriangle, badge: disputes.length || undefined },
    { key: 'audit', label: 'Audit Log', icon: Shield },
    { key: 'blacklist', label: 'Blacklist', icon: BanIcon },
    { key: 'announcements', label: 'Announcements', icon: Megaphone },
    { key: 'config', label: 'Settings', icon: Settings },
  ];

  const getRefreshFn = () => {
    const map: Record<Tab, () => void> = { analytics: loadAnalytics, bookings: loadBookings, vehicles: loadVehicles, users: loadUsers, audit: loadAuditLogs, config: loadConfig, blacklist: loadBlacklist, disputes: loadDisputes, announcements: loadAnnouncements };
    return map[activeTab] || loadAnalytics;
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* ─── Sidebar ─────────────────────────── */}
      <aside className={`hidden lg:flex flex-col flex-shrink-0 border-r border-white/[0.06] bg-[#0f1017] transition-all duration-200 ${sidebarCollapsed ? 'w-16' : 'w-56'}`}>
        <div className="p-4 border-b border-white/[0.06]">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white leading-tight">Admin</p>
                <p className="text-[10px] text-[#6b7280]">Management Console</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="flex items-center justify-center">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {!sidebarCollapsed && <p className="text-[10px] font-semibold text-[#4b5058] uppercase tracking-widest px-3 mb-2">Main</p>}
          {navItems.slice(0, 5).map(item =>
            sidebarCollapsed ? (
              <button key={item.key} onClick={() => setActiveTab(item.key)} title={item.label}
                className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors mb-0.5 ${activeTab === item.key ? 'bg-white/[0.08] text-white' : 'text-[#8a8f98] hover:bg-white/[0.04]'}`}>
                <item.icon className="w-4 h-4" />
              </button>
            ) : (
              <SideNavItem key={item.key} icon={item.icon} label={item.label} active={activeTab === item.key} onClick={() => setActiveTab(item.key)} badge={item.badge} />
            )
          )}

          {!sidebarCollapsed && <p className="text-[10px] font-semibold text-[#4b5058] uppercase tracking-widest px-3 mt-5 mb-2">System</p>}
          {sidebarCollapsed && <div className="border-t border-white/[0.06] my-2" />}
          {navItems.slice(5).map(item =>
            sidebarCollapsed ? (
              <button key={item.key} onClick={() => setActiveTab(item.key)} title={item.label}
                className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors mb-0.5 ${activeTab === item.key ? 'bg-white/[0.08] text-white' : 'text-[#8a8f98] hover:bg-white/[0.04]'}`}>
                <item.icon className="w-4 h-4" />
              </button>
            ) : (
              <SideNavItem key={item.key} icon={item.icon} label={item.label} active={activeTab === item.key} onClick={() => setActiveTab(item.key)} />
            )
          )}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <button onClick={() => setSidebarCollapsed(c => !c)} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-full flex items-center justify-center p-2 text-[#6b7280] hover:text-[#c9cdd4] rounded-lg hover:bg-white/[0.04] transition-colors">
            <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* ─── Mobile Tab Bar ──────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f1017]/95 backdrop-blur-lg border-t border-white/[0.06] z-40 px-1 py-1.5 flex gap-0.5 overflow-x-auto">
        {navItems.slice(0, 5).map(item => (
          <button key={item.key} onClick={() => setActiveTab(item.key)}
            className={`flex flex-col items-center gap-0.5 flex-1 min-w-[52px] py-1 px-1 rounded-lg text-[10px] transition-colors ${activeTab === item.key ? 'text-indigo-400 bg-indigo-500/10' : 'text-[#6b7280]'}`}>
            <item.icon className="w-4 h-4" />
            <span className="truncate">{item.label}</span>
          </button>
        ))}
        <div className="relative group flex-1 min-w-[52px]">
          <button className="flex flex-col items-center gap-0.5 w-full py-1 px-1 rounded-lg text-[10px] text-[#6b7280]">
            <MoreVertical className="w-4 h-4" />
            <span>More</span>
          </button>
        </div>
      </div>

      {/* ─── Main Content ────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-[#0d0e14]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <h1 className="text-[15px] font-semibold text-white">
                {navItems.find(n => n.key === activeTab)?.label || 'Dashboard'}
              </h1>
              <span className="text-[11px] text-[#4b5058]">/</span>
              <span className="text-[11px] text-[#6b7280]">{format(new Date(), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={getRefreshFn()} className="p-2 text-[#6b7280] hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors" title="Refresh data">
                <RefreshCw className="w-4 h-4" />
              </button>
              {(activeTab === 'bookings' || activeTab === 'analytics') && (
                <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#c9cdd4] bg-white/[0.06] hover:bg-white/[0.1] rounded-lg transition-colors">
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-6">

          {/* ═══════════ ANALYTICS ═══════════ */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {analyticsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
                </div>
              ) : analyticsError ? (
                <ErrorState message={analyticsError} onRetry={loadAnalytics} />
              ) : analytics ? (
                <>
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Revenue" value={`₹${((analytics.totalRevenue || 0) / 1000).toFixed(1)}k`} subValue="all time" icon={DollarSign} color="green" trend="+12.5%" trendUp />
                    <StatCard label="Bookings" value={String(analytics.totalBookings || 0)} subValue="total" icon={Calendar} color="blue" trend="+8.2%" trendUp />
                    <StatCard label="Users" value={String(analytics.totalUsers || 0)} subValue="registered" icon={Users} color="purple" trend="+5.1%" trendUp />
                    <StatCard label="Vehicles" value={String(analytics.totalVehicles || 0)} subValue="listed" icon={Car} color="orange" />
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 bg-[#16171f] border border-white/[0.06] rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-[13px] font-semibold text-white">Revenue Trend</h3>
                          <p className="text-[11px] text-[#6b7280] mt-0.5">Monthly revenue overview</p>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[#6b7280] bg-white/[0.04] rounded-md px-2 py-1">
                          <Activity className="w-3 h-3" /> Live
                        </div>
                      </div>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={analytics.revenueTrend || []}>
                            <defs>
                              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={50} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={1.5} dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Booking Status Pie */}
                    <div className="bg-[#16171f] border border-white/[0.06] rounded-xl p-5">
                      <h3 className="text-[13px] font-semibold text-white mb-1">Status Distribution</h3>
                      <p className="text-[11px] text-[#6b7280] mb-4">Booking breakdown</p>
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={analytics.statusDistribution || []} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={2} dataKey="count" nameKey="status" stroke="none">
                              {(analytics.statusDistribution || []).map((_: any, i: number) => (
                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-2 space-y-1.5">
                        {(analytics.statusDistribution || []).slice(0, 4).map((s: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                              <span className="text-[#8a8f98] capitalize">{s.status}</span>
                            </div>
                            <span className="text-white font-medium">{s.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Top Vehicles + Metrics Sidebar */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 bg-[#16171f] border border-white/[0.06] rounded-xl p-5">
                      <h3 className="text-[13px] font-semibold text-white mb-1">Top Performing Vehicles</h3>
                      <p className="text-[11px] text-[#6b7280] mb-4">Ranked by total bookings</p>
                      <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={(analytics.topVehicles || []).slice(0, 6)} barSize={28}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis dataKey="title" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={30} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="bookings" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Revenue Breakdown */}
                      <div className="bg-[#16171f] border border-white/[0.06] rounded-xl p-5">
                        <h3 className="text-[13px] font-semibold text-white mb-3">Revenue Breakdown</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[#8a8f98]">GMV</span>
                            <span className="text-[13px] font-semibold text-emerald-400">₹{((analytics.gmv || 0) / 1000).toFixed(1)}k</span>
                          </div>
                          <div className="w-full bg-white/[0.04] rounded-full h-1.5">
                            <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, ((analytics.commissionRevenue || 0) / Math.max(analytics.gmv || 1, 1)) * 100)}%` }} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[#8a8f98]">Commission</span>
                            <span className="text-[13px] font-semibold text-indigo-400">₹{((analytics.commissionRevenue || 0) / 1000).toFixed(1)}k</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                            <span className="text-[12px] text-[#8a8f98]">Cancellation Rate</span>
                            <span className={`text-[13px] font-semibold ${(analytics.cancellationRate || 0) > 15 ? 'text-red-400' : 'text-emerald-400'}`}>
                              {(analytics.cancellationRate || 0).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Alerts */}
                      <div className="bg-[#16171f] border border-white/[0.06] rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <h3 className="text-[13px] font-semibold text-white">Alerts</h3>
                        </div>
                        {(analytics.fraudAlerts || []).length === 0 ? (
                          <div className="flex items-center gap-2 text-[12px] text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" /> No fraud alerts
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {(analytics.fraudAlerts || []).slice(0, 4).map((alert: any, i: number) => (
                              <div key={i} className="text-[11px] text-amber-300/80 bg-amber-500/8 rounded-md px-2.5 py-1.5 border border-amber-500/10">
                                {alert.type}: {alert.message || alert.userId?.slice(-6)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Top Cities */}
                      <div className="bg-[#16171f] border border-white/[0.06] rounded-xl p-5">
                        <h3 className="text-[13px] font-semibold text-white mb-3">Top Cities</h3>
                        <div className="space-y-2">
                          {(analytics.topCities || []).slice(0, 4).map((city: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-[12px]">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-[#4b5058] font-mono w-4 text-right">{i + 1}.</span>
                                <span className="text-[#c9cdd4]">{city.city}</span>
                              </div>
                              <span className="text-[#8a8f98]">{city.bookings}</span>
                            </div>
                          ))}
                          {(analytics.topCities || []).length === 0 && <p className="text-[12px] text-[#4b5058]">No data available</p>}
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                          <span className="text-[11px] text-[#6b7280]">New users (30d)</span>
                          <span className="text-[15px] font-semibold text-white">{(analytics.userGrowth || []).reduce((s: number, g: any) => s + (g.newUsers || 0), 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* ═══════════ BOOKINGS ═══════════ */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6b7280]" />
                  <input type="text" placeholder="Search bookings..." value={bookingsSearch} onChange={e => setBookingsSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-[12px] bg-[#16171f] border border-white/[0.06] rounded-lg text-[#c9cdd4] placeholder-[#4b5058] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors" />
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[#6b7280]">
                  <span>{bookingsTotal} total</span>
                  <span className="text-[#2a2b36]">|</span>
                  <span>Page {bookingsPage}</span>
                </div>
              </div>

              {bookingsLoading ? (
                <div className="space-y-1">{Array.from({ length: 6 }).map((_, i) => <BookingRowSkeleton key={i} />)}</div>
              ) : filteredBookings.length === 0 ? (
                <EmptyState title="No bookings found" description={bookingsSearch ? 'Try a different search term.' : 'No bookings in the system.'} />
              ) : (
                <>
                  <TableShell headers={['Booking ID', 'Vehicle', 'Dates', 'Status', 'Amount', 'Created']}>
                    {filteredBookings.map(b => (
                      <tr key={b._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-[11px] text-[#8a8f98] bg-white/[0.04] px-1.5 py-0.5 rounded">#{b._id?.slice(-8)}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-[#e1e2e5] text-[13px]">{b.vehicleTitle || '—'}</td>
                        <td className="px-4 py-3 text-[#8a8f98] text-[12px]">{format(new Date(b.startDate), 'MMM d')} – {format(new Date(b.endDate), 'MMM d, yyyy')}</td>
                        <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                        <td className="px-4 py-3 text-[13px] font-medium text-[#e1e2e5]">₹{b.priceBreakdown?.total?.toLocaleString() || '—'}</td>
                        <td className="px-4 py-3 text-[12px] text-[#6b7280]">{b.createdAt ? format(new Date(b.createdAt), 'MMM d, yyyy') : '—'}</td>
                      </tr>
                    ))}
                  </TableShell>
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[12px] text-[#6b7280]">Showing {(bookingsPage - 1) * 20 + 1}–{Math.min(bookingsPage * 20, bookingsTotal)} of {bookingsTotal}</p>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setBookingsPage(p => Math.max(1, p - 1))} disabled={bookingsPage <= 1} title="Previous page"
                        className="p-1.5 text-[#6b7280] hover:text-white hover:bg-white/[0.06] rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="px-2 py-1 text-[12px] text-[#8a8f98] bg-white/[0.04] rounded-md min-w-[32px] text-center">{bookingsPage}</span>
                      <button onClick={() => setBookingsPage(p => p + 1)} disabled={bookings.length < 20} title="Next page"
                        className="p-1.5 text-[#6b7280] hover:text-white hover:bg-white/[0.06] rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ═══════════ VEHICLES ═══════════ */}
          {activeTab === 'vehicles' && (
            <div className="space-y-4">
              <SectionHeader title="Vehicle Moderation" subtitle={`${vehicles.length} vehicles`} />
              {vehiclesLoading ? (
                <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <BookingRowSkeleton key={i} />)}</div>
              ) : vehicles.length === 0 ? (
                <EmptyState title="No vehicles" description="No vehicles registered." />
              ) : (
                <TableShell headers={['Vehicle', 'Location', 'Rate', 'Status', 'Actions']}>
                  {vehicles.map(v => (
                    <tr key={v._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#1c1d27] overflow-hidden flex-shrink-0 border border-white/[0.04]">
                            {v.images?.[0] ? <img src={v.images[0].url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Car className="w-4 h-4 text-[#4b5058]" /></div>}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-[#e1e2e5]">{v.title}</p>
                            <p className="text-[11px] text-[#6b7280] font-mono">#{v._id?.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#8a8f98]">{v.location || '—'}</td>
                      <td className="px-4 py-3 text-[13px] font-medium text-[#e1e2e5]">₹{v.pricing?.baseRate?.toLocaleString()}/d</td>
                      <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                      <td className="px-4 py-3">
                        {v.status === 'pending_approval' ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => handleApprove(v._id)} className="px-2.5 py-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-md transition-colors">Approve</button>
                            <button onClick={() => handleReject(v._id)} className="px-2.5 py-1 text-[11px] font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-md transition-colors">Reject</button>
                          </div>
                        ) : <span className="text-[11px] text-[#4b5058]">—</span>}
                      </td>
                    </tr>
                  ))}
                </TableShell>
              )}
            </div>
          )}

          {/* ═══════════ USERS ═══════════ */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <SectionHeader title="User Management" subtitle={`${users.length} users registered`} />
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6b7280]" />
                  <input type="text" placeholder="Search users..." value={usersSearch} onChange={e => setUsersSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-[12px] bg-[#16171f] border border-white/[0.06] rounded-lg text-[#c9cdd4] placeholder-[#4b5058] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors" />
                </div>
              </div>
              {usersLoading ? (
                <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <BookingRowSkeleton key={i} />)}</div>
              ) : filteredUsers.length === 0 ? (
                <EmptyState title="No users found" description={usersSearch ? 'Try a different search term.' : 'No users in the system.'} />
              ) : (
                <TableShell headers={['User', 'Email', 'Role', 'Joined', 'Status']}>
                  {filteredUsers.map(u => (
                    <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-500/15 flex items-center justify-center text-[11px] font-semibold text-indigo-400 flex-shrink-0">{u.name?.charAt(0)?.toUpperCase() || '?'}</div>
                          <span className="text-[13px] font-medium text-[#e1e2e5]">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#8a8f98]">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                          : u.role === 'owner' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-white/[0.06] text-[#8a8f98] border border-white/[0.06]'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#6b7280]">{u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${u.isActive !== false ? 'bg-emerald-500' : 'bg-[#4b5058]'}`} />
                          <span className="text-[11px] text-[#8a8f98]">{u.isActive !== false ? 'Active' : 'Inactive'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </TableShell>
              )}
            </div>
          )}

          {/* ═══════════ AUDIT ═══════════ */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <SectionHeader title="Audit Trail" subtitle="System activity log" />
              {auditLoading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <BookingRowSkeleton key={i} />)}</div>
              ) : auditLogs.length === 0 ? (
                <EmptyState title="No activity" description="No audit events recorded." />
              ) : (
                <TableShell headers={['Action', 'Actor', 'Entity', 'Details', 'Time']}>
                  {auditLogs.map(log => (
                    <tr key={log._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3"><span className="text-[12px] font-medium text-[#e1e2e5] bg-white/[0.04] px-2 py-0.5 rounded-md">{log.action}</span></td>
                      <td className="px-4 py-3 text-[12px] text-[#8a8f98]">{log.actorEmail || log.actorId?.slice(-6) || '—'}</td>
                      <td className="px-4 py-3 text-[11px] text-[#6b7280] font-mono">{log.entityType}:{log.entityId?.slice(-6)}</td>
                      <td className="px-4 py-3 text-[11px] text-[#6b7280] max-w-[220px] truncate">{log.details ? JSON.stringify(log.details) : '—'}</td>
                      <td className="px-4 py-3 text-[11px] text-[#6b7280]">{log.createdAt ? format(new Date(log.createdAt), 'MMM d, HH:mm') : '—'}</td>
                    </tr>
                  ))}
                </TableShell>
              )}
            </div>
          )}

          {/* ═══════════ CONFIG ═══════════ */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              <SectionHeader title="Platform Settings" subtitle="System configuration values" />
              {configLoading ? (
                <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-[#16171f] rounded-xl animate-pulse border border-white/[0.04]" />)}</div>
              ) : (
                <div className="bg-[#16171f] border border-white/[0.06] rounded-xl divide-y divide-white/[0.04] overflow-hidden">
                  {configs.map(cfg => (
                    <div key={cfg._id} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Hash className="w-3 h-3 text-[#4b5058]" />
                          <p className="text-[13px] font-medium text-[#e1e2e5]">{cfg.key}</p>
                        </div>
                        {cfg.description && <p className="text-[11px] text-[#6b7280] mt-0.5 ml-5">{cfg.description}</p>}
                      </div>
                      {editingConfig === cfg.key ? (
                        <div className="flex items-center gap-2">
                          <input type="text" value={configVal} onChange={e => setConfigVal(e.target.value)} autoFocus title="Config value" placeholder="Value"
                            className="w-28 text-[12px] bg-[#0d0e14] border border-indigo-500/30 rounded-md px-2.5 py-1.5 text-[#e1e2e5] focus:outline-none focus:border-indigo-500/60" />
                          <button onClick={async () => {
                            try { await adminAPI.updateConfig(cfg.key, isNaN(Number(configVal)) ? configVal : Number(configVal), cfg.description); customToast.success('Updated'); setEditingConfig(null); loadConfig(); }
                            catch { customToast.error('Update failed'); }
                          }} className="px-2.5 py-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-md transition-colors">Save</button>
                          <button onClick={() => setEditingConfig(null)} className="px-2.5 py-1 text-[11px] text-[#6b7280] hover:text-[#c9cdd4] rounded-md transition-colors">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-[13px] font-mono text-indigo-400 bg-indigo-500/8 px-2 py-0.5 rounded">{String(cfg.value)}</span>
                          <button onClick={() => { setEditingConfig(cfg.key); setConfigVal(String(cfg.value)); }} className="text-[11px] text-[#6b7280] hover:text-indigo-400 transition-colors">Edit</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════ BLACKLIST ═══════════ */}
          {activeTab === 'blacklist' && (
            <div className="space-y-5">
              <SectionHeader title="Blacklisted Users" subtitle="Users flagged for policy violations" />
              {blacklistLoading ? (
                <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-[#16171f] rounded-xl animate-pulse border border-white/[0.04]" />)}</div>
              ) : blacklist.length === 0 ? (
                <EmptyState title="No blacklisted users" description="Users flagged for suspicious activity will appear here." />
              ) : (
                <div className="bg-[#16171f] border border-white/[0.06] rounded-xl divide-y divide-white/[0.04] overflow-hidden">
                  {blacklist.map(bl => (
                    <div key={bl._id} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center"><BanIcon className="w-3.5 h-3.5 text-red-400" /></div>
                        <div>
                          <p className="text-[13px] font-medium text-[#e1e2e5]">{bl.user?.name || bl.userId}</p>
                          <p className="text-[11px] text-[#6b7280]">{bl.user?.email} · {bl.reason}</p>
                        </div>
                      </div>
                      <button onClick={async () => {
                        try { await adminAPI.unblacklistUser(bl.userId); customToast.success('User removed from blacklist'); loadBlacklist(); }
                        catch { customToast.error('Failed'); }
                      }} className="px-3 py-1.5 text-[11px] font-medium text-red-400 bg-red-500/8 hover:bg-red-500/15 border border-red-500/15 rounded-md transition-colors">Remove</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-[#16171f] border border-white/[0.06] rounded-xl p-5">
                <h3 className="text-[13px] font-semibold text-white mb-3">Add to Blacklist</h3>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input id="bl-uid" type="text" placeholder="User ID"
                    className="flex-1 text-[12px] bg-[#0d0e14] border border-white/[0.06] rounded-lg px-3 py-2 text-[#c9cdd4] placeholder-[#4b5058] focus:outline-none focus:border-indigo-500/50" />
                  <input id="bl-reason" type="text" placeholder="Reason for blacklisting"
                    className="flex-1 text-[12px] bg-[#0d0e14] border border-white/[0.06] rounded-lg px-3 py-2 text-[#c9cdd4] placeholder-[#4b5058] focus:outline-none focus:border-indigo-500/50" />
                  <button onClick={async () => {
                    const uid = (document.getElementById('bl-uid') as HTMLInputElement)?.value;
                    const reason = (document.getElementById('bl-reason') as HTMLInputElement)?.value;
                    if (!uid || !reason) { customToast.error('Both fields required'); return; }
                    try { await adminAPI.blacklistUser(uid, reason); customToast.success('User blacklisted'); loadBlacklist(); }
                    catch { customToast.error('Failed'); }
                  }} className="px-4 py-2 text-[12px] font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors whitespace-nowrap">Blacklist User</button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ DISPUTES ═══════════ */}
          {activeTab === 'disputes' && (
            <div className="space-y-4">
              <SectionHeader title="Active Disputes" subtitle={`${disputes.length} open disputes`} />
              {disputesLoading ? (
                <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-[#16171f] rounded-xl animate-pulse border border-white/[0.04]" />)}</div>
              ) : disputes.length === 0 ? (
                <div className="bg-[#16171f] border border-white/[0.06] rounded-xl p-10 text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-400/50 mx-auto mb-3" />
                  <p className="text-[13px] font-medium text-[#c9cdd4]">All clear</p>
                  <p className="text-[12px] text-[#6b7280] mt-1">No disputes require attention.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {disputes.map(d => (
                    <div key={d._id} className="bg-[#16171f] border border-white/[0.06] rounded-xl px-5 py-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><AlertTriangle className="w-3.5 h-3.5 text-amber-400" /></div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-[13px] font-medium text-[#e1e2e5]">Booking</p>
                              <span className="font-mono text-[11px] text-[#8a8f98] bg-white/[0.04] px-1.5 py-0.5 rounded">#{d._id?.slice(-6)}</span>
                            </div>
                            <p className="text-[11px] text-[#6b7280] mt-0.5">User: {d.userId?.slice(-8)} · Owner: {d.ownerId?.slice(-8)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={async () => {
                            try {
                              await fetch(`/api/bookings/${d._id}/resolve`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` }, body: JSON.stringify({ resolution: 'refund', notes: 'Admin resolved: refund' }) });
                              customToast.success('Resolved with refund'); loadDisputes();
                            } catch { customToast.error('Failed'); }
                          }} className="px-3 py-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-md transition-colors">Refund</button>
                          <button onClick={async () => {
                            try {
                              await fetch(`/api/bookings/${d._id}/resolve`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` }, body: JSON.stringify({ resolution: 'complete', notes: 'Admin resolved: no refund' }) });
                              customToast.success('Resolved'); loadDisputes();
                            } catch { customToast.error('Failed'); }
                          }} className="px-3 py-1.5 text-[11px] font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-md transition-colors">Dismiss</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════ ANNOUNCEMENTS ═══════════ */}
          {activeTab === 'announcements' && (
            <div className="space-y-5">
              <SectionHeader title="Announcements" subtitle="Broadcast messages to users" />

              {/* Create form */}
              <div className="bg-[#16171f] border border-white/[0.06] rounded-xl p-5">
                <h3 className="text-[13px] font-semibold text-white mb-4">New Announcement</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wider mb-1.5 block">Title</label>
                    <input type="text" placeholder="Announcement title" value={newAnn.title} onChange={e => setNewAnn(p => ({ ...p, title: e.target.value }))}
                      className="w-full text-[12px] bg-[#0d0e14] border border-white/[0.06] rounded-lg px-3 py-2.5 text-[#c9cdd4] placeholder-[#4b5058] focus:outline-none focus:border-indigo-500/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wider mb-1.5 block">Type</label>
                      <select value={newAnn.type} onChange={e => setNewAnn(p => ({ ...p, type: e.target.value }))} title="Announcement type"
                        className="w-full text-[12px] bg-[#0d0e14] border border-white/[0.06] rounded-lg px-3 py-2.5 text-[#c9cdd4] focus:outline-none focus:border-indigo-500/50">
                        {['info', 'warning', 'success', 'error'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wider mb-1.5 block">Target</label>
                      <select value={newAnn.targetRole} onChange={e => setNewAnn(p => ({ ...p, targetRole: e.target.value }))} title="Target role"
                        className="w-full text-[12px] bg-[#0d0e14] border border-white/[0.06] rounded-lg px-3 py-2.5 text-[#c9cdd4] focus:outline-none focus:border-indigo-500/50">
                        {['all', 'user', 'owner', 'admin'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wider mb-1.5 block">Message</label>
                    <textarea placeholder="Enter your announcement message..." value={newAnn.message} onChange={e => setNewAnn(p => ({ ...p, message: e.target.value }))}
                      className="w-full text-[12px] bg-[#0d0e14] border border-white/[0.06] rounded-lg px-3 py-2.5 text-[#c9cdd4] placeholder-[#4b5058] min-h-[80px] focus:outline-none focus:border-indigo-500/50 resize-none" />
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <button onClick={async () => {
                      if (!newAnn.title || !newAnn.message) { customToast.error('Title and message are required'); return; }
                      try { await announcementsAPI.create({ ...newAnn, broadcast: true }); customToast.success('Announcement published'); setNewAnn({ title: '', message: '', type: 'info', targetRole: 'all' }); loadAnnouncements(); }
                      catch { customToast.error('Failed'); }
                    }} className="px-4 py-2 text-[12px] font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5">
                      <Megaphone className="w-3.5 h-3.5" /> Publish
                    </button>
                  </div>
                </div>
              </div>

              {/* Existing */}
              {announcementsLoading ? (
                <div className="space-y-2">{[...Array(2)].map((_, i) => <div key={i} className="h-16 bg-[#16171f] rounded-xl animate-pulse border border-white/[0.04]" />)}</div>
              ) : announcements.length === 0 ? (
                <EmptyState title="No announcements" description="Create an announcement to broadcast to users." />
              ) : (
                <div className="space-y-2">
                  {announcements.map(ann => {
                    const typeStyle = ann.type === 'warning' ? 'border-l-amber-500' : ann.type === 'error' ? 'border-l-red-500' : ann.type === 'success' ? 'border-l-emerald-500' : 'border-l-blue-500';
                    return (
                      <div key={ann._id} className={`bg-[#16171f] border border-white/[0.06] border-l-2 ${typeStyle} rounded-xl px-5 py-4 hover:bg-white/[0.02] transition-colors`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-[13px] font-medium text-[#e1e2e5]">{ann.title}</p>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider ${
                                ann.type === 'warning' ? 'bg-amber-500/10 text-amber-400' : ann.type === 'error' ? 'bg-red-500/10 text-red-400' : ann.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                              }`}>{ann.type}</span>
                            </div>
                            <p className="text-[12px] text-[#8a8f98] line-clamp-2">{ann.message}</p>
                            <div className="flex items-center gap-3 mt-2 text-[11px] text-[#4b5058]">
                              <span>Target: {ann.targetRole}</span>
                              {ann.createdAt && <span>{format(new Date(ann.createdAt), 'MMM d, yyyy')}</span>}
                            </div>
                          </div>
                          <button onClick={async () => {
                            try { await announcementsAPI.delete(ann._id); customToast.success('Deleted'); loadAnnouncements(); }
                            catch { customToast.error('Failed'); }
                          }} className="p-1.5 text-[#4b5058] hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors flex-shrink-0" title="Delete announcement">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
