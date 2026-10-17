const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, protectAdmin } = require('../middleware/auth');

// Public
router.get('/product/:productId', reviewController.getProductReviews);

// Customer
router.post('/', protect, reviewController.createReview);
router.get('/my', protect, reviewController.getMyReviews);

// Admin
router.get('/admin/all', protectAdmin, reviewController.adminGetReviews);
router.put('/:id/approve', protectAdmin, reviewController.approveReview);
router.put('/:id/reject', protectAdmin, reviewController.rejectReview);
router.delete('/:id', protectAdmin, reviewController.deleteReview);

module.exports = router;
