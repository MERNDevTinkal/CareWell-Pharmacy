import adminApi from './adminApi';

export const dashboardService = {
  getStats: () => adminApi.get('/admin/dashboard/stats'),
  getSalesChart: (days = 7) => adminApi.get('/admin/dashboard/sales-chart', { params: { days } }),
  getBestSellers: () => adminApi.get('/admin/dashboard/best-sellers'),
  getRecentOrders: () => adminApi.get('/admin/dashboard/recent-orders'),
  getRecentActivity: () => adminApi.get('/admin/dashboard/recent-activity')
};
