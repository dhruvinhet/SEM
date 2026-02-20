import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('accessToken');
      // Only redirect if not already on auth page
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth API ────────────────────────────────────────────────
export const authAPI = {
  signup: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  profile: () => api.get('/auth/profile'),
  updateProfile: (data: { name?: string; phone?: string; address?: string }) =>
    api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
};

// ─── Vehicles API ────────────────────────────────────────────
export const vehiclesAPI = {
  search: (params?: Record<string, any>) =>
    api.get('/vehicles', { params }),
  list: (params?: Record<string, any>) =>
    api.get('/vehicles', { params }),
  get: (id: string) =>
    api.get(`/vehicles/${id}`),
  create: (data: any) =>
    api.post('/vehicles', data),
  update: (id: string, data: any) =>
    api.put(`/vehicles/${id}`, data),
  delete: (id: string) =>
    api.delete(`/vehicles/${id}`),
  uploadImages: (id: string, filesOrFormData: File[] | FormData) => {
    let formData: FormData;
    if (filesOrFormData instanceof FormData) {
      formData = filesOrFormData;
    } else {
      formData = new FormData();
      filesOrFormData.forEach((f) => formData.append('files', f));
    }
    return api.post(`/vehicles/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ─── Bookings API ────────────────────────────────────────────
export const bookingsAPI = {
  create: (data: any) =>
    api.post('/bookings', data),
  list: (params?: Record<string, any>) =>
    api.get('/bookings', { params }),
  get: (id: string) =>
    api.get(`/bookings/${id}`),
  confirm: (id: string) =>
    api.post(`/bookings/${id}/confirm`),
  cancel: (id: string, reason?: string) =>
    api.post(`/bookings/${id}/cancel`, { reason }),
  dispute: (id: string, reason?: string) =>
    api.post(`/bookings/${id}/dispute`, { reason }),
  resolve: (id: string, data: { resolution: string; notes?: string }) =>
    api.post(`/bookings/${id}/resolve`, data),
};

// ─── Payments API ────────────────────────────────────────────
export const paymentsAPI = {
  charge: (data: { bookingId: string; method: string; amount: number }) =>
    api.post('/payments/charge', data),
  refund: (data: { bookingId: string; amount?: number }) =>
    api.post('/payments/refund', data),
  getForBooking: (bookingId: string) =>
    api.get(`/payments/booking/${bookingId}`),
};

// ─── Admin API ───────────────────────────────────────────────
export const adminAPI = {
  analytics: (range?: string) =>
    api.get('/admin/analytics', { params: { range } }),
  bookings: (params?: Record<string, any>) =>
    api.get('/admin/bookings', { params }),
  exportCSV: (params?: Record<string, any>) =>
    api.get('/admin/bookings/export', { params, responseType: 'blob' }),
  exportBookingsCSV: (params?: Record<string, any>) =>
    api.get('/admin/bookings/export', { params, responseType: 'blob' }),
  vehicles: (params?: Record<string, any>) =>
    api.get('/admin/vehicles', { params }),
  approveVehicle: (id: string) =>
    api.post(`/admin/vehicles/${id}/approve`),
  rejectVehicle: (id: string, reason: string) =>
    api.post(`/admin/vehicles/${id}/reject`, null, { params: { reason } }),
  auditLogs: (params?: Record<string, any>) =>
    api.get('/admin/audit-logs', { params }),
  users: (params?: Record<string, any>) =>
    api.get('/admin/users', { params }),
};

// ─── Reviews API ─────────────────────────────────────────────
export const reviewsAPI = {
  create: (data: { bookingId: string; vehicleId: string; rating: number; comment: string }) =>
    api.post('/reviews', data),
  getForVehicle: (vehicleId: string) =>
    api.get(`/reviews/vehicle/${vehicleId}`),
};

// ─── Notifications API ──────────────────────────────────────
export const notificationsAPI = {
  list: (params?: Record<string, any>) =>
    api.get('/notifications', { params }),
  markRead: (ids?: string[]) =>
    api.post('/notifications/mark-read', { ids }),
};
