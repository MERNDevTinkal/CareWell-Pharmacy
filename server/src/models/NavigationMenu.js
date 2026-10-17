const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  label: { type: String, required: true },
  url: { type: String, required: true },
  target: { type: String, enum: ['_self', '_blank'], default: '_self' },
  icon: { type: String },
  order: { type: Number, default: 0 },
  children: [{ label: String, url: String, target: String, order: Number }]
});

const navigationMenuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, enum: ['header', 'footer_col1', 'footer_col2', 'footer_col3', 'footer_bottom'], unique: true },
  items: [menuItemSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('NavigationMenu', navigationMenuSchema);
