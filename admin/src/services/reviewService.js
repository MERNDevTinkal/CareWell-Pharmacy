import adminApi from './adminApi';

export const reviewService = {
  getReviews: (params) => adminApi.get('/reviews/admin/all', { params }),
  approveReview: (id) => adminApi.put(`/reviews/${id}/approve`),
  rejectReview: (id) => adminApi.put(`/reviews/${id}/reject`),
  deleteReview: (id) => adminApi.delete(`/reviews/${id}`)
};
