import adminApi from './adminApi';

export const customerService = {
  getCustomers: (params) => adminApi.get('/admin/customers', { params }),
  getCustomer: (id) => adminApi.get(`/admin/customers/${id}`),
  toggleStatus: (id) => adminApi.patch(`/admin/customers/${id}/toggle-status`)
};
