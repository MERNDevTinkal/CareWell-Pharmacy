const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  mrp: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  weight: { type: String },
  isActive: { type: Boolean, default: true }
});

const reviewSummarySchema = new mongoose.Schema({
  average: { type: Number, default: 0, min: 0, max: 5 },
  count: { type: Number, default: 0 },
  distribution: { 1: Number, 2: Number, 3: Number, 4: Number, 5: Number }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true, lowercase: true },
  shortDescription: { type: String, trim: true, maxlength: 500 },
  description: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  sku: { type: String, required: true, unique: true },
  mrp: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  stock: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  images: [{ url: String, alt: String, isPrimary: Boolean, order: Number }],
  variants: [variantSchema],
  tags: [String],
  ingredients: { type: String },
  composition: { type: String },
  manufacturer: { type: String },
  countryOfOrigin: { type: String, default: 'India' },
  storage: { type: String },
  warnings: { type: String },
  usageInstructions: { type: String },
  sideEffects: { type: String },
  prescriptionRequired: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  weight: { type: String },
  dimensions: { length: Number, width: Number, height: Number },
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  reviewSummary: { type: reviewSummarySchema, default: () => ({}) },
  salesCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  seo: { title: String, description: String, keywords: String },
  hsnCode: { type: String },
  gstRate: { type: Number, default: 12 }
}, { timestamps: true, suppressReservedKeysWarning: true });

productSchema.index({ slug: 1, isActive: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ brand: 1, isActive: 1 });
productSchema.index({ name: 'text', shortDescription: 'text', tags: 'text' });
productSchema.index({ price: 1, mrp: 1, isFeatured: 1 });
module.exports = mongoose.model('Product', productSchema);
