import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Car, Menu, X, Bell, User, LogOut, LayoutDashboard,
  ChevronDown, Search, Sparkles
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/auth/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'owner') return '/owner/dashboard';
    return '/user/dashboard';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass-enhanced shadow-lg shadow-black/20 border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="DriveX Home">
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:rotate-[-3deg] group-hover:shadow-glow">
              <Car className="w-5 h-5 text-white" strokeWidth={2.5} />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[22px] font-display font-extrabold tracking-tight text-white">
                Drive<span className="text-gradient">X</span>
              </span>
              <span className="text-[9px] font-mono font-medium tracking-[0.2em] uppercase text-dark-400 mt-0.5">
                car rental
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { to: '/search', icon: Search, label: 'Browse Cars' },
              ...(isAuthenticated
                ? [{ to: getDashboardPath(), icon: LayoutDashboard, label: 'Dashboard' }]
                : []),
            ].map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                  isActive(to) || (label === 'Dashboard' && (location.pathname.includes('dashboard') || location.pathname.includes('admin')))
                    ? 'text-primary-400 bg-primary-500/10 border border-primary-500/20'
                    : 'text-dark-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-2.5 rounded-full transition-all duration-200 hover:bg-white/[0.06]"
                  aria-label="Notifications"
                >
                  <Bell className="w-[18px] h-[18px] text-dark-300" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-accent-500 rounded-full ring-2 ring-dark-900 animate-pulse" />
                </Link>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className={`flex items-center gap-2 p-1 pr-2.5 rounded-full transition-all duration-300 ${
                      profileOpen
                        ? 'bg-white/[0.08] ring-1 ring-primary-500/30'
                        : 'hover:bg-white/[0.06]'
                    }`}
                    aria-expanded={profileOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-neon-purple flex items-center justify-center ring-2 ring-dark-900">
                      <span className="text-xs font-bold text-white">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-dark-200 max-w-[100px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-dark-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl overflow-hidden animate-scale-in border border-white/[0.08] bg-dark-800/95 backdrop-blur-xl shadow-elevated">
                      <div className="p-4 bg-gradient-to-br from-primary-500/10 to-neon-purple/5 border-b border-white/[0.06]">
                        <p className="text-sm font-semibold text-white">{user?.name}</p>
                        <p className="text-xs text-dark-400 mt-0.5">{user?.email}</p>
                        <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent-500/15 text-accent-400 border border-accent-500/20">
                          {user?.role}
                        </span>
                      </div>
                      <div className="p-1.5">
                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-dark-200 hover:bg-white/[0.06] rounded-xl transition-colors"
                        >
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        <Link
                          to={getDashboardPath()}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-dark-200 hover:bg-white/[0.06] rounded-xl transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <div className="h-px bg-white/[0.06] my-1 mx-3" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-dark-300 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link to="/auth/signup" className="btn-primary text-sm !px-5 !py-2.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Get started
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-white/[0.06] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-dark-900/95 backdrop-blur-2xl border-t border-white/[0.06] animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            <Link
              to="/search"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-200 hover:bg-white/[0.06] font-medium transition-colors"
            >
              <Search className="w-4 h-4 text-primary-400" /> Browse Cars
            </Link>
            {isAuthenticated && (
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-200 hover:bg-white/[0.06] font-medium transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-primary-400" /> Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
