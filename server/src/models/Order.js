const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  productSlug: { type: String },
  sku: { type: String },
  brand: { type: String },
  image: { type: String },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  quantity: { type: Number, required: true, min: 1 },
  prescriptionRequired: { type: Boolean, default: false },
  variantName: { type: String }
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'updatedByModel' },
  updatedByModel: { type: String, enum: ['User', 'AdminUser'] },
  updatedByName: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestId: { type: String },
  customerInfo: { name: String, email: String, phone: String },
  items: [orderItemSchema],
  shippingAddress: {
    name: String, phone: String, line1: String, line2: String,
    city: String, state: String, pincode: String, country: String
  },
  subtotal: { type: Number, required: true },
  shippingCharge: { type: Number, default: 0 },
  couponCode: { type: String },
  couponDiscount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending_confirmation', 'prescription_review_pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned', 'refund_pending', 'refunded'],
    default: 'pending_confirmation'
  },
  statusHistory: [statusHistorySchema],
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['demo_upi', 'demo_card', 'demo_netbanking', 'cod'], required: true },
  paymentTransaction: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentTransaction' },
  prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  requiresPrescription: { type: Boolean, default: false },
  trackingNumber: { type: String },
  trackingUrl: { type: String },
  courier: { type: String },
  notes: { type: String },
  cancelReason: { type: String },
  estimatedDelivery: { type: Date },
  deliveredAt: { type: Date },
  invoiceNumber: { type: String }
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
module.exports = mongoose.model('Order', orderSchema);
