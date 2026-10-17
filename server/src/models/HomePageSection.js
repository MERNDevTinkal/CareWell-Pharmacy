const mongoose = require('mongoose');

const homePageSectionSchema = new mongoose.Schema({
  type: { type: String, enum: ['hero_banner', 'category_collection', 'featured_products', 'best_sellers', 'promotion', 'wellness_collection', 'testimonials', 'article_collection', 'trust_info', 'custom_content', 'offers', 'new_arrivals', 'prescription_promo'], required: true },
  title: { type: String },
  subtitle: { type: String },
  description: { type: String },
  image: { type: String },
  imageAlt: { type: String },
  ctaText: { type: String },
  ctaLink: { type: String },
  backgroundColor: { type: String },
  textColor: { type: String },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  productFilter: {
    featured: Boolean,
    bestSeller: Boolean,
    isNew: Boolean,
    category: mongoose.Schema.Types.ObjectId,
    limit: { type: Number, default: 8 }
  },
  customData: { type: mongoose.Schema.Types.Mixed },
  displayOrder: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true }
}, { timestamps: true });

homePageSectionSchema.index({ displayOrder: 1, isVisible: 1 });
module.exports = mongoose.model('HomePageSection', homePageSectionSchema);
