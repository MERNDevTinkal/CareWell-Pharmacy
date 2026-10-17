import api from './api';

export const brandService = {
  getBrands: (params) => api.get('/brands', { params }),
  getBrand: (slug) => api.get(`/brands/${slug}`),
};
