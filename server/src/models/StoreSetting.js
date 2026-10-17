const mongoose = require('mongoose');

const storeSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
  group: { type: String, default: 'general' },
  label: { type: String },
  type: { type: String, enum: ['string', 'number', 'boolean', 'json', 'array'], default: 'string' }
}, { timestamps: true });

module.exports = mongoose.model('StoreSetting', storeSettingSchema);
