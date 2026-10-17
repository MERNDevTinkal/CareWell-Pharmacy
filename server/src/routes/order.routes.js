const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, protectAdmin, optionalAuth } = require('../middleware/auth');

// Customer routes
router.post('/', optionalAuth, orderController.createOrder);
router.get('/my', protect, orderController.getMyOrders);
router.get('/my/:id', protect, orderController.getMyOrder);
router.put('/:id/cancel', protect, orderController.cancelOrder);
router.post('/:id/return', protect, orderController.requestReturn);

// Admin routes
router.get('/', protectAdmin, orderController.getOrders);
router.get('/:id', protectAdmin, orderController.getOrder);
router.put('/:id/status', protectAdmin, orderController.updateOrderStatus);
router.put('/:id/tracking', protectAdmin, orderController.addTracking);
router.get('/:id/invoice', protectAdmin, orderController.generateInvoice);

module.exports = router;
