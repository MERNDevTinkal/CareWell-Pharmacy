const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  excerpt: { type: String, maxlength: 500 },
  content: { type: String },
  coverImage: { type: String },
  author: { name: String, avatar: String },
  category: { type: String },
  tags: [String],
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  readTime: { type: Number, default: 5 },
  viewCount: { type: Number, default: 0 },
  seo: { title: String, description: String, keywords: String }
}, { timestamps: true });

blogPostSchema.index({ slug: 1, isPublished: 1 });
module.exports = mongoose.model('BlogPost', blogPostSchema);
