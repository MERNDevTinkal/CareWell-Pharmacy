import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cw_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    const guestId = localStorage.getItem('cw_guest_id');
    if (guestId) config.headers['x-guest-id'] = guestId;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('cw_token');
      localStorage.removeItem('cw_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject({ message, status: error.response?.status });
  }
);

export default api;
