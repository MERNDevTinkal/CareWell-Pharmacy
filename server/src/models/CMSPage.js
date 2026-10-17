const mongoose = require('mongoose');

const cmsPageSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  content: { type: String },
  type: { type: String, enum: ['about', 'contact', 'privacy', 'terms', 'shipping', 'returns', 'prescription_policy', 'disclaimer', 'faq', 'custom'], default: 'custom' },
  isPublished: { type: Boolean, default: false },
  seo: { title: String, description: String, keywords: String },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' }
}, { timestamps: true });

module.exports = mongoose.model('CMSPage', cmsPageSchema);
