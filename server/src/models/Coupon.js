const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true, min: 0 },
  minPurchase: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  totalLimit: { type: Number },
  perCustomerLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  usedBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, usedAt: Date, orderId: mongoose.Schema.Types.ObjectId }],
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

couponSchema.index({ code: 1, isActive: 1 });
module.exports = mongoose.model('Coupon', couponSchema);
