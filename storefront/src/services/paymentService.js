import api from './api';

export const paymentService = {
  initiatePayment: (orderId, method) => api.post('/payments/initiate', { orderId, method }),
  verifyPayment: (data) => api.post('/payments/verify', data),
  retryPayment: (orderId) => api.post(`/payments/${orderId}/retry`),
};
