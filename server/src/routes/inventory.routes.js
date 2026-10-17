const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protectAdmin } = require('../middleware/auth');

router.use(protectAdmin);

router.get('/', inventoryController.getInventory);
router.post('/adjust', inventoryController.adjustStock);
router.get('/movements', inventoryController.getStockMovements);
router.get('/batches', inventoryController.getBatches);
router.post('/batches', inventoryController.createBatch);
router.put('/batches/:id', inventoryController.updateBatch);
router.get('/alerts/low-stock', inventoryController.getLowStockAlerts);
router.get('/alerts/near-expiry', inventoryController.getNearExpiryAlerts);

module.exports = router;
