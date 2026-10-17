import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL
  ? (import.meta.env.VITE_API_URL.endsWith('/api/v1') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/v1`)
  : '/api/v1';

const adminApi = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
});

adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cw_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('cw_admin_token');
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject({ message, status: error.response?.status, data: error.response?.data });
  }
);

export default adminApi;
