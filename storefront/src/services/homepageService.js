import api from './api';

export const homepageService = {
  getSections: () => api.get('/homepage/sections'),
};
