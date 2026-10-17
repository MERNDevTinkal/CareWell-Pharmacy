import adminApi from './adminApi';

export const adminUserService = {
  getAdminUsers: () => adminApi.get('/admin-users'),
  createAdminUser: (data) => adminApi.post('/admin-users', data),
  updateAdminUser: (id, data) => adminApi.put(`/admin-users/${id}`, data),
  deleteAdminUser: (id) => adminApi.delete(`/admin-users/${id}`),
  toggleStatus: (id) => adminApi.patch(`/admin-users/${id}/toggle-status`)
};
