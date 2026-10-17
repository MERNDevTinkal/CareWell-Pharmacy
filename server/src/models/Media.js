const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String },
  url: { type: String, required: true },
  mimetype: { type: String },
  size: { type: Number },
  alt: { type: String },
  folder: { type: String, default: 'general' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
  usedIn: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Media', mediaSchema);
