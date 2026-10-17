const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId, status: 'approved' });
  const count = reviews.length;
  if (count === 0) {
    await Product.findByIdAndUpdate(productId, {
      'reviewSummary.average': 0,
      'reviewSummary.count': 0
    });
    return;
  }

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const average = Number((sum / count).toFixed(1));

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => {
    if (distribution[r.rating] !== undefined) distribution[r.rating]++;
  });

  await Product.findByIdAndUpdate(productId, {
    'reviewSummary.average': average,
    'reviewSummary.count': count,
    'reviewSummary.distribution': distribution
  });
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pg = parseInt(page);
    const lm = parseInt(limit);
    const skip = (pg - 1) * lm;

    const [reviews, total] = await Promise.all([
      Review.find({ product: productId, status: 'approved' })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lm)
        .lean(),
      Review.countDocuments({ product: productId, status: 'approved' })
    ]);

    sendPaginated(res, reviews, total, pg, lm);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment, images } = req.body;
    if (!productId || !rating) return sendError(res, 'Product ID and rating are required');

    // Check if user already reviewed
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) return sendError(res, 'You have already reviewed this product');

    // Check if verified purchase
    const orderWithProduct = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      status: 'delivered'
    });

    const isVerifiedPurchase = !!orderWithProduct;

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      order: orderWithProduct ? orderWithProduct._id : undefined,
      rating: Number(rating),
      title: title || '',
      comment: comment || '',
      images: images || [],
      isVerifiedPurchase,
      status: 'approved' // Automatically approve for smooth demo experience, or 'pending'
    });

    await updateProductRating(productId);

    sendSuccess(res, review, 'Review submitted successfully', 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('product', 'name slug images')
      .sort({ createdAt: -1 });
    sendSuccess(res, reviews);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// Admin operations
exports.adminGetReviews = async (req, res) => {
  try {
    const { page = 1, limit = 15, status, search } = req.query;
    const query = {};
    if (status) query.status = status;

    const pg = parseInt(page);
    const lm = parseInt(limit);
    const skip = (pg - 1) * lm;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('product', 'name slug images')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lm)
        .lean(),
      Review.countDocuments(query)
    ]);

    sendPaginated(res, reviews, total, pg, lm);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.approveReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return sendError(res, 'Review not found', 404);

    review.status = 'approved';
    await review.save();
    await updateProductRating(review.product);

    sendSuccess(res, review, 'Review approved');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.rejectReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return sendError(res, 'Review not found', 404);

    review.status = 'rejected';
    await review.save();
    await updateProductRating(review.product);

    sendSuccess(res, review, 'Review rejected');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return sendError(res, 'Review not found', 404);

    const productId = review.product;
    await review.deleteOne();
    await updateProductRating(productId);

    sendSuccess(res, null, 'Review deleted');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
