const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { optionalAuth, protect } = require('../middleware/auth');

router.use(optionalAuth);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/item/:itemId', cartController.updateCartItem);
router.delete('/item/:itemId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);
router.post('/coupon', cartController.applyCoupon);
router.delete('/coupon', cartController.removeCoupon);
router.post('/merge', protect, cartController.mergeCarts);

module.exports = router;
