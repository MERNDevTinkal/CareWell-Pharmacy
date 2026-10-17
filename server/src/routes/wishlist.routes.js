const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', wishlistController.getWishlist);
router.post('/add', wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);
router.post('/move-to-cart', wishlistController.moveToCart);

module.exports = router;
