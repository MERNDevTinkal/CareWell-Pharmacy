import adminApi from './adminApi';

export const settingsService = {
  getSettings: () => adminApi.get('/settings/all'),
  updateSettings: (data) => adminApi.put('/settings', data),
  getNavigation: () => adminApi.get('/settings/navigation/all'),
  updateNavigation: (data) => adminApi.put('/settings/navigation', data)
};
