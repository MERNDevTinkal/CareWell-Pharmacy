const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protectAdmin } = require('../middleware/auth');

router.use(protectAdmin);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/sales-chart', dashboardController.getSalesChart);
router.get('/best-sellers', dashboardController.getBestSellingProducts);
router.get('/recent-orders', dashboardController.getRecentOrders);
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router;
