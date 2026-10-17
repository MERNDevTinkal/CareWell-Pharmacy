import adminApi from './adminApi';

export const orderService = {
  getOrders: (params) => adminApi.get('/orders', { params }),
  getOrder: (id) => adminApi.get(`/orders/${id}`),
  updateOrderStatus: (id, status, note) => adminApi.put(`/orders/${id}/status`, { status, note }),
  addTracking: (id, data) => adminApi.put(`/orders/${id}/tracking`, data),
  generateInvoice: (id) => adminApi.get(`/orders/${id}/invoice`),
  processRefund: (data) => adminApi.post('/payments/refund', data)
};
