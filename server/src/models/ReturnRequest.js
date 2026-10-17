const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ product: mongoose.Schema.Types.ObjectId, productName: String, quantity: Number, reason: String }],
  reason: { type: String, required: true },
  description: { type: String },
  images: [String],
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  refundAmount: { type: Number },
  adminNotes: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' }
}, { timestamps: true });

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
