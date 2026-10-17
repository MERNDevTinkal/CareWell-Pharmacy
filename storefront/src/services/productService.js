import api from './api';

export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (slug) => api.get(`/products/${slug}`),
  getFeatured: () => api.get('/products/featured'),
  getBestSellers: () => api.get('/products/best-sellers'),
  getNewArrivals: () => api.get('/products/new-arrivals'),
  searchProducts: (q) => api.get('/products/search', { params: { q } }),
  getRelated: (id) => api.get(`/products/${id}/related`),
};
