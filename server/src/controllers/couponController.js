const Coupon = require('../models/Coupon');
const { sendSuccess, sendError } = require('../utils/response');

exports.validateCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;
    if (!code) return sendError(res, 'Coupon code is required');

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return sendError(res, 'Invalid coupon code', 404);

    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) {
      return sendError(res, 'This coupon is not active yet');
    }
    if (coupon.endDate && coupon.endDate < now) {
      return sendError(res, 'This coupon has expired');
    }

    if (coupon.totalLimit && coupon.usedCount >= coupon.totalLimit) {
      return sendError(res, 'This coupon usage limit has been reached');
    }

    const orderAmount = Number(amount) || 0;
    if (coupon.minPurchase && orderAmount < coupon.minPurchase) {
      return sendError(res, `Minimum purchase of ₹${coupon.minPurchase} required to use this coupon`);
    }

    if (req.user && coupon.perCustomerLimit) {
      const userUsageCount = coupon.usedBy?.filter(u => u.user?.toString() === req.user._id.toString()).length || 0;
      if (userUsageCount >= coupon.perCustomerLimit) {
        return sendError(res, 'You have reached the maximum usage limit for this coupon');
      }
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (orderAmount * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(coupon.value, orderAmount);
    }

    sendSuccess(res, {
      code: coupon.code,
      discount: Math.round(discount),
      type: coupon.type,
      value: coupon.value,
      description: coupon.description
    }, 'Coupon applied successfully');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    sendSuccess(res, coupons);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return sendError(res, 'Coupon code is required');

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) return sendError(res, 'Coupon code already exists');

    const coupon = await Coupon.create({
      ...req.body,
      code: code.toUpperCase()
    });

    sendSuccess(res, coupon, 'Coupon created successfully', 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    if (req.body.code) req.body.code = req.body.code.toUpperCase();
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return sendError(res, 'Coupon not found', 404);
    sendSuccess(res, coupon, 'Coupon updated');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return sendError(res, 'Coupon not found', 404);
    await coupon.deleteOne();
    sendSuccess(res, null, 'Coupon deleted');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getCouponStats = async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ isActive: true });
    const coupons = await Coupon.find().select('code usedCount');
    const totalUsed = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
    sendSuccess(res, { totalCoupons, activeCoupons, totalUsed });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
