import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('accessToken');
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth ────────────────────────────────────────────────────
export const authAPI = {
  signup: (data: { name: string; email: string; password: string; role: string; referralCode?: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  profile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
  referral: () => api.get('/auth/referral'),
};

// ─── Vehicles ────────────────────────────────────────────────
export const vehiclesAPI = {
  search: (params?: Record<string, any>) => api.get('/vehicles', { params }),
  list: (params?: Record<string, any>) => api.get('/vehicles', { params }),
  get: (id: string) => api.get(`/vehicles/${id}`),
  create: (data: any) => api.post('/vehicles', data),
  update: (id: string, data: any) => api.put(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
  uploadImages: (id: string, filesOrFormData: File[] | FormData) => {
    const formData = filesOrFormData instanceof FormData
      ? filesOrFormData
      : (() => { const fd = new FormData(); (filesOrFormData as File[]).forEach(f => fd.append('files', f)); return fd; })();
    return api.post(`/vehicles/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// ─── Bookings ────────────────────────────────────────────────
export const bookingsAPI = {
  create: (data: any) => api.post('/bookings', data),
  list: (params?: Record<string, any>) => api.get('/bookings', { params }),
  get: (id: string) => api.get(`/bookings/${id}`),
  confirm: (id: string) => api.post(`/bookings/${id}/confirm`),
  cancel: (id: string, reason?: string) => api.post(`/bookings/${id}/cancel`, { reason }),
  dispute: (id: string, reason?: string) => api.post(`/bookings/${id}/dispute`, { reason }),
  resolve: (id: string, data: { resolution: string; notes?: string }) => api.post(`/bookings/${id}/resolve`, data),
  lateReturn: (id: string, actualReturnTime: string) => api.post(`/bookings/${id}/late-return`, { actualReturnTime }),
};

// ─── Payments ────────────────────────────────────────────────
export const paymentsAPI = {
  charge: (data: { bookingId: string; method: string; amount: number }) => api.post('/payments/charge', data),
  refund: (data: { bookingId: string; amount?: number }) => api.post('/payments/refund', data),
  getForBooking: (bookingId: string) => api.get(`/payments/booking/${bookingId}`),
};

// ─── Admin ───────────────────────────────────────────────────
export const adminAPI = {
  analytics: (range?: string) => api.get('/admin/analytics', { params: { range } }),
  ownerAnalytics: (ownerId: string, range?: string) => api.get(`/admin/owner-analytics/${ownerId}`, { params: { range } }),

  bookings: (params?: Record<string, any>) => api.get('/admin/bookings', { params }),
  createBooking: (data: any) => api.post('/admin/bookings', data),
  cancelBooking: (id: string, reason?: string) => api.post(`/admin/bookings/${id}/cancel`, null, { params: { reason } }),
  bulkCancelBookings: (bookingIds: string[], reason?: string) => api.post('/admin/bookings/bulk-cancel', { bookingIds, reason }),
  exportCSV: (params?: Record<string, any>) => api.get('/admin/bookings/export', { params, responseType: 'blob' }),
  exportBookingsCSV: (params?: Record<string, any>) => api.get('/admin/bookings/export', { params, responseType: 'blob' }),

  vehicles: (params?: Record<string, any>) => api.get('/admin/vehicles', { params }),
  approveVehicle: (id: string) => api.post(`/admin/vehicles/${id}/approve`),
  rejectVehicle: (id: string, reason: string) => api.post(`/admin/vehicles/${id}/reject`, null, { params: { reason } }),
  bulkApproveVehicles: (vehicleIds: string[]) => api.post('/admin/vehicles/bulk-approve', { vehicleIds }),
  updateVehicle: (id: string, data: any) => api.put(`/admin/vehicles/${id}`, data),
  deleteVehicle: (id: string) => api.delete(`/admin/vehicles/${id}`),

  users: (params?: Record<string, any>) => api.get('/admin/users', { params }),
  createUser: (data: any) => api.post('/admin/users', data),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  blacklistUser: (userId: string, reason: string) => api.post('/admin/users/blacklist', { userId, reason }),
  unblacklistUser: (id: string) => api.post(`/admin/users/${id}/unblacklist`),
  blacklist: () => api.get('/admin/blacklist'),

  auditLogs: (params?: Record<string, any>) => api.get('/admin/audit-logs', { params }),
  config: () => api.get('/admin/config'),
  updateConfig: (key: string, value: any, description?: string) => api.put(`/admin/config/${key}`, { value, description }),

  payments: (params?: Record<string, any>) => api.get('/admin/payments', { params }),
  refundPayment: (bookingId: string, amount?: number) => api.post('/admin/payments/refund', null, { params: { booking_id: bookingId, amount } }),
  disputes: (params?: Record<string, any>) => api.get('/admin/disputes', { params }),
};

// ─── Reviews ─────────────────────────────────────────────────
export const reviewsAPI = {
  create: (data: { bookingId: string; vehicleId: string; rating: number; comment: string }) =>
    api.post('/reviews', data),
  getForVehicle: (vehicleId: string) => api.get(`/reviews/vehicle/${vehicleId}`),
};

// ─── Notifications ───────────────────────────────────────────
export const notificationsAPI = {
  list: (params?: Record<string, any>) => api.get('/notifications', { params }),
  markRead: (ids?: string[]) => api.post('/notifications/mark-read', { ids }),
};

// ─── Coupons ─────────────────────────────────────────────────
export const couponsAPI = {
  list: (params?: Record<string, any>) => api.get('/coupons', { params }),
  create: (data: any) => api.post('/coupons', data),
  validate: (code: string, bookingAmount?: number) => api.post('/coupons/validate', { code, bookingAmount }),
  toggle: (id: string) => api.put(`/coupons/${id}/toggle`),
  delete: (id: string) => api.delete(`/coupons/${id}`),
};

// ─── Trip Reports ─────────────────────────────────────────────
export const tripReportsAPI = {
  checklist: (type: 'pre_trip' | 'post_trip') => api.get(`/trip-reports/checklist/${type}`),
  create: (data: any) => api.post('/trip-reports', data),
  uploadPhotos: (id: string, files: File[]) => {
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    return api.post(`/trip-reports/${id}/photos`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getForBooking: (bookingId: string) => api.get(`/trip-reports/booking/${bookingId}`),
  get: (id: string) => api.get(`/trip-reports/${id}`),
};

// ─── Verifications ────────────────────────────────────────────
export const verificationsAPI = {
  submit: (data: any) => api.post('/verifications', data),
  uploadDocs: (id: string, files: File[]) => {
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    return api.post(`/verifications/${id}/documents`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  myVerifications: () => api.get('/verifications/my'),
  list: (params?: Record<string, any>) => api.get('/verifications', { params }),
  review: (id: string, data: { status: string; notes?: string }) => api.post(`/verifications/${id}/review`, data),
};

// ─── Announcements ────────────────────────────────────────────
export const announcementsAPI = {
  list: () => api.get('/announcements'),
  create: (data: any) => api.post('/announcements', data),
  delete: (id: string) => api.delete(`/announcements/${id}`),
};

// ─── Search Utils ─────────────────────────────────────────────
export const searchAPI = {
  saveSearch: (data: { name: string; filters: Record<string, any> }) => api.post('/search/saved', data),
  savedSearches: () => api.get('/search/saved'),
  deleteSavedSearch: (id: string) => api.delete(`/search/saved/${id}`),
  trackView: (vehicleId: string) => api.post(`/search/recently-viewed/${vehicleId}`),
  recentlyViewed: () => api.get('/search/recently-viewed'),
};

// ─── Owner Analytics ──────────────────────────────────────────
export const ownerAPI = {
  analytics: (range?: string) => api.get('/owner/analytics/me', { params: { range } }),
};
