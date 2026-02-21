import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, CalendarDays, User, Bell } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function MobileBottomNav() {
  const { user } = useAuthStore();
  const location = useLocation();

  // Hide on auth pages
  if (location.pathname.startsWith('/auth')) return null;

  const dashboardPath =
    user?.role === 'admin' ? '/admin' :
    user?.role === 'owner' ? '/owner/dashboard' :
    user ? '/user/dashboard' : '/auth/login';

  const baseClass =
    'flex flex-col items-center gap-0.5 py-2 px-3 text-xs font-medium transition-colors';
  const activeClass = 'text-primary-500';
  const inactiveClass = 'text-dark-400';

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-dark-950/90 backdrop-blur-2xl border-t border-white/[0.06] flex justify-around md:hidden safe-area-pb">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
      >
        <Home className="w-5 h-5" />
        Home
      </NavLink>

      <NavLink
        to="/search"
        className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
      >
        <Search className="w-5 h-5" />
        Search
      </NavLink>

      <NavLink
        to={dashboardPath}
        className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
      >
        <CalendarDays className="w-5 h-5" />
        Bookings
      </NavLink>

      {user && (
        <NavLink
          to="/notifications"
          className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
        >
          <Bell className="w-5 h-5" />
          Alerts
        </NavLink>
      )}

      <NavLink
        to={user ? '/profile' : '/auth/login'}
        className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
      >
        <User className="w-5 h-5" />
        {user ? 'Profile' : 'Login'}
      </NavLink>
    </nav>
  );
}
