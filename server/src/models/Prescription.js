const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  files: [{ url: String, filename: String, mimetype: String, size: Number }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewNote: { type: String },
  rejectionReason: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
  reviewedAt: { type: Date },
  validUntil: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
