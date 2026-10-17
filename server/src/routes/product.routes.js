const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protectAdmin } = require('../middleware/auth');
const { uploadProductImages } = require('../config/multer');

// Public routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/best-sellers', productController.getBestSellers);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/search', productController.searchProducts);
router.get('/:id/related', productController.getRelatedProducts);
router.get('/:slug', productController.getProduct);

// Admin routes
router.post('/', protectAdmin, productController.createProduct);
router.put('/:id', protectAdmin, productController.updateProduct);
router.delete('/:id', protectAdmin, productController.deleteProduct);
router.post('/:id/images', protectAdmin, uploadProductImages.array('images', 10), productController.uploadProductImages);
router.patch('/:id/featured', protectAdmin, productController.toggleFeatured);
router.patch('/:id/bestseller', protectAdmin, productController.toggleBestSeller);

module.exports = router;
