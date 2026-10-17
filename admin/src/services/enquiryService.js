import adminApi from './adminApi';

export const enquiryService = {
  getEnquiries: (params) => adminApi.get('/contact/enquiries', { params }),
  updateStatus: (id, data) => adminApi.put(`/contact/enquiries/${id}`, data)
};
