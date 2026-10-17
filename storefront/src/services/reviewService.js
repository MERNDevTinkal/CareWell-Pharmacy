import api from './api';

export const reviewService = {
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  createReview: (data) => api.post('/reviews', data),
  getMyReviews: () => api.get('/reviews/my'),
};
