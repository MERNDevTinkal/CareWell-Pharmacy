import adminApi from './adminApi';

export const prescriptionService = {
  getPrescriptions: (params) => adminApi.get('/prescriptions', { params }),
  reviewPrescription: (id, data) => adminApi.put(`/prescriptions/${id}/review`, data)
};
