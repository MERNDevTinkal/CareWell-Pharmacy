import api from './api';

export const orderService = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my', { params }),
  getMyOrder: (id) => api.get(`/orders/my/${id}`),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  requestReturn: (id, data) => api.post(`/orders/${id}/return`, data),
};
