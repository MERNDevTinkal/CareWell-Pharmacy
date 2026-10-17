import adminApi from './adminApi';

export const couponService = {
  getCoupons: () => adminApi.get('/coupons'),
  createCoupon: (data) => adminApi.post('/coupons', data),
  updateCoupon: (id, data) => adminApi.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => adminApi.delete(`/coupons/${id}`),
  getStats: () => adminApi.get('/coupons/stats')
};
