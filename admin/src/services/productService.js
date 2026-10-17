import adminApi from './adminApi';

export const productService = {
  getProducts: (params) => adminApi.get('/products', { params }),
  getProduct: (slug) => adminApi.get(`/products/${slug}`),
  createProduct: (data) => adminApi.post('/products', data),
  updateProduct: (id, data) => adminApi.put(`/products/${id}`, data),
  deleteProduct: (id) => adminApi.delete(`/products/${id}`),
  uploadImages: (id, formData) => adminApi.post(`/products/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  toggleFeatured: (id) => adminApi.patch(`/products/${id}/featured`),
  toggleBestSeller: (id) => adminApi.patch(`/products/${id}/bestseller`)
};
