const crypto = require('crypto');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };
  const userData = {
    _id: user._id, name: user.name, email: user.email,
    phone: user.phone, avatar: user.avatar, role: user.role,
    addresses: user.addresses, wishlist: user.wishlist,
    isEmailVerified: user.isEmailVerified, socialProvider: user.socialProvider,
    createdAt: user.createdAt
  };
  res.status(statusCode).cookie('token', token, options).json({ success: true, token, data: userData });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return sendError(res, 'Name, email and password are required');
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return sendError(res, 'Email already registered');
    const user = await User.create({ name, email, password, phone });
    sendToken(user, 201, res);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, 'Email and password are required');
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.password) return sendError(res, 'Invalid credentials', 401);
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return sendError(res, 'Invalid credentials', 401);
    if (!user.isActive) return sendError(res, 'Account is deactivated. Contact support.', 401);
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });
    sendToken(user, 200, res);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.logout = async (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  sendSuccess(res, null, 'Logged out successfully');
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name slug images price mrp');
    sendSuccess(res, user);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 'Email is required');
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return sendError(res, 'No user found with this email', 404);
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    // In demo mode, return token directly
    if (process.env.DEMO_MODE === 'true') {
      return sendSuccess(res, { resetToken, message: 'DEMO MODE: Use this token to reset password' }, 'Reset token generated (demo mode)');
    }
    sendSuccess(res, null, 'Password reset email sent');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password) return sendError(res, 'Password is required');
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return sendError(res, 'Invalid or expired reset token', 400);
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user, 200, res);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true, runValidators: true });
    sendSuccess(res, user, 'Profile updated');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return sendError(res, 'Current and new password required');
    const user = await User.findById(req.user._id).select('+password');
    if (!user.password) return sendError(res, 'Social login account cannot change password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return sendError(res, 'Current password is incorrect', 401);
    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// DEMO ONLY: Simulate social login
exports.demoSocialLogin = async (req, res) => {
  try {
    const { provider, name, email } = req.body;
    if (!email) return sendError(res, 'Email is required');
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: name || `${provider} User`,
        email: email.toLowerCase(),
        socialProvider: 'demo',
        socialId: `demo_${Date.now()}`,
        isEmailVerified: true
      });
    }
    if (!user.isActive) return sendError(res, 'Account is deactivated', 401);
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });
    sendToken(user, 200, res);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }
    user.addresses.push(req.body);
    await user.save();
    sendSuccess(res, user.addresses, 'Address added');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return sendError(res, 'Address not found', 404);
    if (req.body.isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }
    Object.assign(address, req.body);
    await user.save();
    sendSuccess(res, user.addresses, 'Address updated');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.pull({ _id: req.params.addressId });
    await user.save();
    sendSuccess(res, user.addresses, 'Address removed');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
