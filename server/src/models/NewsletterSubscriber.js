const mongoose = require('mongoose');

const newsletterSubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String },
  isActive: { type: Boolean, default: true },
  source: { type: String, default: 'website' }
}, { timestamps: true });

module.exports = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
