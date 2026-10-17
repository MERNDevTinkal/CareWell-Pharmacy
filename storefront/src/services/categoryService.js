import api from './api';

export const categoryService = {
  getCategories: () => api.get('/categories'),
  getCategory: (slug) => api.get(`/categories/${slug}`),
  getCategoryTree: () => api.get('/categories/tree'),
};
