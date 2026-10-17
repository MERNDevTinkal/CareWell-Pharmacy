const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  method: { type: String, enum: ['demo_upi', 'demo_card', 'demo_netbanking', 'cod'], required: true },
  status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
  transactionRef: { type: String, unique: true },
  gatewayResponse: { type: mongoose.Schema.Types.Mixed },
  notes: { type: String },
  refundedAt: { type: Date },
  refundAmount: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
