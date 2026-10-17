const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { optionalAuth, protectAdmin } = require('../middleware/auth');

router.post('/validate', optionalAuth, couponController.validateCoupon);

router.get('/', protectAdmin, couponController.getCoupons);
router.post('/', protectAdmin, couponController.createCoupon);
router.get('/stats', protectAdmin, couponController.getCouponStats);
router.put('/:id', protectAdmin, couponController.updateCoupon);
router.delete('/:id', protectAdmin, couponController.deleteCoupon);

module.exports = router;
