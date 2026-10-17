import adminApi from './adminApi';

export const homepageService = {
  getSections: () => adminApi.get('/homepage/admin/sections'),
  createSection: (data) => adminApi.post('/homepage/sections', data),
  updateSection: (id, data) => adminApi.put(`/homepage/sections/${id}`, data),
  deleteSection: (id) => adminApi.delete(`/homepage/sections/${id}`),
  reorderSections: (orders) => adminApi.put('/homepage/sections/reorder', { orders })
};
