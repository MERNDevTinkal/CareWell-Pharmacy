const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { optionalAuth, protectAdmin } = require('../middleware/auth');

router.post('/initiate', optionalAuth, paymentController.initiatePayment);
router.post('/verify', optionalAuth, paymentController.verifyPayment);
router.post('/:orderId/retry', optionalAuth, paymentController.retryPayment);
router.post('/refund', protectAdmin, paymentController.processRefund);

module.exports = router;
