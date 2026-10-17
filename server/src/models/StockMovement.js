const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['in', 'out', 'adjustment', 'return'], required: true },
  quantity: { type: Number, required: true },
  previousStock: { type: Number },
  newStock: { type: Number },
  reason: { type: String },
  reference: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
  note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
