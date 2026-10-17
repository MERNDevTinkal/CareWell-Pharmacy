import adminApi from './adminApi';

export const brandService = {
  getBrands: () => adminApi.get('/brands'),
  createBrand: (data) => adminApi.post('/brands', data),
  updateBrand: (id, data) => adminApi.put(`/brands/${id}`, data),
  deleteBrand: (id) => adminApi.delete(`/brands/${id}`)
};
