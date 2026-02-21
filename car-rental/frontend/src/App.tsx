import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import MobileBottomNav from './components/MobileBottomNav';
import { useRippleEffect } from './hooks/useRippleEffect';

// Pages
import Landing from './pages/Landing';
import { LoginPage, SignupPage } from './pages/Auth';
import SearchPage from './pages/SearchPage';
import VehicleDetails from './pages/VehicleDetails';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-display font-bold text-white">404</h1>
      <p className="text-dark-400 mt-2 mb-6">Page not found</p>
      <a href="/" className="btn-primary">Go Home</a>
    </div>
  );
}

export default function App() {
  useRippleEffect();

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#1e293b',
            color: '#f8fafc',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/vehicle/:id" element={<VehicleDetails />} />

          {/* Authenticated */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* User */}
          <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
          </Route>

          {/* Owner */}
          <Route element={<ProtectedRoute allowedRoles={['owner', 'admin']} />}>
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <MobileBottomNav />
    </BrowserRouter>
  );
}