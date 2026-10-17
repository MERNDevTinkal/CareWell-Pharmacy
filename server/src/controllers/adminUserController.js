const AdminUser = require('../models/AdminUser');
const { sendSuccess, sendError } = require('../utils/response');

exports.getAdminUsers = async (req, res) => {
  try {
    const admins = await AdminUser.find().select('-password').sort({ createdAt: -1 });
    sendSuccess(res, admins);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.createAdminUser = async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;
    if (!name || !email || !password) {
      return sendError(res, 'Name, email and password are required');
    }

    const existing = await AdminUser.findOne({ email: email.toLowerCase() });
    if (existing) return sendError(res, 'Email already registered');

    const admin = await AdminUser.create({
      name,
      email,
      password,
      role: role || 'content_manager',
      permissions: permissions || []
    });

    const adminData = admin.toObject();
    delete adminData.password;

    sendSuccess(res, adminData, 'Admin user created successfully', 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateAdminUser = async (req, res) => {
  try {
    const { name, role, permissions, password, isActive } = req.body;
    const admin = await AdminUser.findById(req.params.id);
    if (!admin) return sendError(res, 'Admin not found', 404);

    if (name) admin.name = name;
    if (role) admin.role = role;
    if (permissions) admin.permissions = permissions;
    if (isActive !== undefined) admin.isActive = isActive;
    if (password) admin.password = password;

    await admin.save();

    const adminData = admin.toObject();
    delete adminData.password;

    sendSuccess(res, adminData, 'Admin updated successfully');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.deleteAdminUser = async (req, res) => {
  try {
    if (req.params.id === req.admin._id.toString()) {
      return sendError(res, 'Cannot delete your own admin account');
    }

    const admin = await AdminUser.findById(req.params.id);
    if (!admin) return sendError(res, 'Admin not found', 404);

    await admin.deleteOne();
    sendSuccess(res, null, 'Admin user deleted');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.toggleAdminStatus = async (req, res) => {
  try {
    if (req.params.id === req.admin._id.toString()) {
      return sendError(res, 'Cannot deactivate your own admin account');
    }

    const admin = await AdminUser.findById(req.params.id);
    if (!admin) return sendError(res, 'Admin not found', 404);

    admin.isActive = !admin.isActive;
    await admin.save();

    sendSuccess(res, admin, `Admin account ${admin.isActive ? 'activated' : 'deactivated'}`);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
