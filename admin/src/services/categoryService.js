import adminApi from './adminApi';

export const categoryService = {
  getCategories: () => adminApi.get('/categories'),
  getCategory: (slug) => adminApi.get(`/categories/${slug}`),
  createCategory: (data) => adminApi.post('/categories', data),
  updateCategory: (id, data) => adminApi.put(`/categories/${id}`, data),
  deleteCategory: (id) => adminApi.delete(`/categories/${id}`)
};
