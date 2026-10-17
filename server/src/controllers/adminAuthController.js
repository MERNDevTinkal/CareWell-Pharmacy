const AdminUser = require('../models/AdminUser');
const { sendSuccess, sendError } = require('../utils/response');

const sendToken = (admin, statusCode, res) => {
  const token = admin.getSignedJwtToken();
  const adminData = {
    _id: admin._id, name: admin.name, email: admin.email,
    role: admin.role, permissions: admin.permissions,
    avatar: admin.avatar, isActive: admin.isActive, lastLogin: admin.lastLogin
  };
  res.status(statusCode).json({ success: true, token, data: adminData });
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, 'Email and password are required');
    const admin = await AdminUser.findOne({ email: email.toLowerCase() }).select('+password');
    if (!admin) return sendError(res, 'Invalid credentials', 401);
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return sendError(res, 'Invalid credentials', 401);
    if (!admin.isActive) return sendError(res, 'Account deactivated. Contact super admin.', 401);
    admin.lastLogin = Date.now();
    await admin.save({ validateBeforeSave: false });
    sendToken(admin, 200, res);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await AdminUser.findById(req.admin._id);
    sendSuccess(res, admin);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const admin = await AdminUser.findByIdAndUpdate(req.admin._id, { name, avatar }, { new: true, runValidators: true });
    sendSuccess(res, admin, 'Profile updated');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return sendError(res, 'Both passwords required');
    const admin = await AdminUser.findById(req.admin._id).select('+password');
    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) return sendError(res, 'Current password is incorrect', 401);
    admin.password = newPassword;
    await admin.save();
    sendToken(admin, 200, res);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
