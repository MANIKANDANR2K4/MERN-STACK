import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.put('/auth/reset-password', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  reactivate: (id) => api.put(`/users/${id}/reactivate`),
  getStats: () => api.get('/users/stats/overview'),
  export: () => api.get('/users/export'),
};

// Buses API
export const busesAPI = {
  getAll: (params) => api.get('/buses', { params }),
  getById: (id) => api.get(`/buses/${id}`),
  create: (data) => api.post('/buses', data),
  update: (id, data) => api.put(`/buses/${id}`, data),
  delete: (id) => api.delete(`/buses/${id}`),
  updateLocation: (id, location) => api.put(`/buses/${id}/location`, location),
  addReview: (id, review) => api.post(`/buses/${id}/reviews`, review),
  getReviews: (id, params) => api.get(`/buses/${id}/reviews`, { params }),
  getNearLocation: (lat, lng, distance) => api.get(`/buses/near/${lat}/${lng}`, { params: { distance } }),
  getStats: () => api.get('/buses/stats/overview'),
};

// Routes API
export const routesAPI = {
  getAll: (params) => api.get('/routes', { params }),
  getById: (id) => api.get(`/routes/${id}`),
  create: (data) => api.post('/routes', data),
  update: (id, data) => api.put(`/routes/${id}`, data),
  delete: (id) => api.delete(`/routes/${id}`),
  search: (params) => api.get('/routes/search', { params }),
  getByDay: (day) => api.get(`/routes/day/${day}`),
  getPopular: (limit) => api.get('/routes/popular', { params: { limit } }),
  getStats: () => api.get('/routes/stats/overview'),
  getSchedule: (id, date) => api.get(`/routes/${id}/schedule`, { params: { date } }),
};

// Bookings API
export const bookingsAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  complete: (id) => api.put(`/bookings/${id}/complete`),
  getUpcoming: () => api.get('/bookings/upcoming'),
  getStats: () => api.get('/bookings/stats/overview'),
};

// Payments API
export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  createIntent: (data) => api.post('/payments/create-intent', data),
  confirm: (id, data) => api.post(`/payments/${id}/confirm`, data),
  refund: (id, data) => api.post(`/payments/${id}/refund`, data),
  cancel: (id, reason) => api.post(`/payments/${id}/cancel`, { reason }),
  retry: (id) => api.post(`/payments/${id}/retry`),
  getStats: () => api.get('/payments/stats/overview'),
  getFailed: (params) => api.get('/payments/failed', { params }),
  export: (params) => api.get('/payments/export', { params }),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getSystemStats: () => api.get('/admin/stats/system'),
  getRealtimeStatus: () => api.get('/admin/status/realtime'),
  getUsersOverview: (params) => api.get('/admin/users/overview', { params }),
  getBusesOverview: (params) => api.get('/admin/buses/overview', { params }),
  getRoutesOverview: (params) => api.get('/admin/routes/overview', { params }),
  getBookingsOverview: (params) => api.get('/admin/bookings/overview', { params }),
  getPaymentsOverview: (params) => api.get('/admin/payments/overview', { params }),
  getLogs: () => api.get('/admin/logs'),
  getHealth: () => api.get('/admin/health'),
};

// File upload helper
export const uploadFile = async (file, type = 'profile') => {
  const formData = new FormData();
  formData.append(type === 'profile' ? 'profileImage' : 'busImage', file);
  
  const response = await api.post(`/upload/${type}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Error handler
export const handleAPIError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default api;
