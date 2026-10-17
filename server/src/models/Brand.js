const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String },
  logo: { type: String },
  logoAlt: { type: String },
  website: { type: String },
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  seo: { title: String, description: String, keywords: String },
  productCount: { type: Number, default: 0 }
}, { timestamps: true });

brandSchema.index({ slug: 1 });
module.exports = mongoose.model('Brand', brandSchema);
