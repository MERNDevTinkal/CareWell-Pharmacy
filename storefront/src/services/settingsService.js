import api from './api';

export const settingsService = {
  getPublicSettings: () => api.get('/settings/public'),
  getNavigation: () => api.get('/settings/navigation'),
};
