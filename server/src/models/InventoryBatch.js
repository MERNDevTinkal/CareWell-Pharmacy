const mongoose = require('mongoose');

const inventoryBatchSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  batchNumber: { type: String, required: true },
  expiryDate: { type: Date },
  quantity: { type: Number, required: true, min: 0 },
  mrp: { type: Number },
  purchasePrice: { type: Number },
  supplier: { type: String },
  notes: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('InventoryBatch', inventoryBatchSchema);
