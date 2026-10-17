const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminUserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['super_admin', 'catalog_manager', 'order_manager', 'prescription_reviewer', 'content_manager'], default: 'content_manager' },
  isActive: { type: Boolean, default: true },
  avatar: { type: String },
  permissions: [{ type: String }],
  lastLogin: { type: Date }
}, { timestamps: true });

adminUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminUserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

adminUserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role, isAdmin: true },
    process.env.JWT_SECRET || 'carewell_pharmacy_jwt_secret_dev_key_2025',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = mongoose.model('AdminUser', adminUserSchema);
