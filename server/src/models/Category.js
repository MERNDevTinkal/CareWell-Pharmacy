const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, trim: true },
  image: { type: String },
  imageAlt: { type: String },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  displayOrder: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  icon: { type: String },
  color: { type: String, default: '#10b981' },
  seo: {
    title: { type: String },
    description: { type: String },
    keywords: { type: String }
  },
  productCount: { type: Number, default: 0 }
}, { timestamps: true });

categorySchema.index({ slug: 1, isVisible: 1 });
module.exports = mongoose.model('Category', categorySchema);
