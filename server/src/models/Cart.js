const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  name: { type: String },
  image: { type: String },
  sku: { type: String },
  prescriptionRequired: { type: Boolean, default: false }
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestId: { type: String },
  items: [cartItemSchema],
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  couponCode: { type: String },
  couponDiscount: { type: Number, default: 0 },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
}, { timestamps: true });

cartSchema.index({ user: 1 });
cartSchema.index({ guestId: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('Cart', cartSchema);
