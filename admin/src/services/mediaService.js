import adminApi from './adminApi';

export const mediaService = {
  getMedia: (params) => adminApi.get('/media', { params }),
  uploadMedia: (formData) => adminApi.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateMedia: (id, data) => adminApi.put(`/media/${id}`, data),
  deleteMedia: (id) => adminApi.delete(`/media/${id}`)
};
