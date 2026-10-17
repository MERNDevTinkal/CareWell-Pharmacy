import adminApi from './adminApi';

export const inventoryService = {
  getInventory: (params) => adminApi.get('/inventory', { params }),
  adjustStock: (data) => adminApi.post('/inventory/adjust', data),
  getMovements: (params) => adminApi.get('/inventory/movements', { params }),
  getBatches: (params) => adminApi.get('/inventory/batches', { params }),
  createBatch: (data) => adminApi.post('/inventory/batches', data),
  getLowStockAlerts: () => adminApi.get('/inventory/alerts/low-stock'),
  getNearExpiryAlerts: () => adminApi.get('/inventory/alerts/near-expiry')
};
