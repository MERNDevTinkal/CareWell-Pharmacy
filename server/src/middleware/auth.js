const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AdminUser = require('../models/AdminUser');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  try {
    const jwtSecret = process.env.JWT_SECRET || 'carewell_pharmacy_jwt_secret_dev_key_2025';
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.isAdmin) {
      req.admin = await AdminUser.findById(decoded.id);
      req.user = req.admin;
      req.isAdmin = true;
    } else {
      req.user = await User.findById(decoded.id);
    }
    if (!req.user || !req.user.isActive) return res.status(401).json({ success: false, message: 'User not found or inactive' });
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

exports.protectAdmin = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Admin access required' });
  try {
    const jwtSecret = process.env.JWT_SECRET || 'carewell_pharmacy_jwt_secret_dev_key_2025';
    const decoded = jwt.verify(token, jwtSecret);
    if (!decoded.isAdmin) return res.status(403).json({ success: false, message: 'Admin access required' });
    req.admin = await AdminUser.findById(decoded.id);
    if (!req.admin || !req.admin.isActive) return res.status(401).json({ success: false, message: 'Admin account not found or inactive' });
    req.user = req.admin;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.admin?.role)) {
    return res.status(403).json({ success: false, message: `Role '${req.admin?.role}' is not authorized` });
  }
  next();
};

exports.optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
  } catch (err) { /* ignore */ }
  next();
};
