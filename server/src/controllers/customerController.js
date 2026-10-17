const User = require('../models/User');
const Order = require('../models/Order');
const Prescription = require('../models/Prescription');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

exports.getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 15, search, isActive } = req.query;
    const query = { role: 'customer' };

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const pg = parseInt(page);
    const lm = parseInt(limit);
    const skip = (pg - 1) * lm;

    const [customers, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(lm).lean(),
      User.countDocuments(query)
    ]);

    // Attach order count to each customer
    for (const c of customers) {
      c.orderCount = await Order.countDocuments({ user: c._id });
    }

    sendPaginated(res, customers, total, pg, lm);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: 'customer' }).select('-password');
    if (!customer) return sendError(res, 'Customer not found', 404);

    const [orders, prescriptions] = await Promise.all([
      Order.find({ user: customer._id }).sort({ createdAt: -1 }),
      Prescription.find({ user: customer._id }).sort({ createdAt: -1 })
    ]);

    sendSuccess(res, { customer, orders, prescriptions });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.toggleCustomerStatus = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer) return sendError(res, 'Customer not found', 404);

    customer.isActive = !customer.isActive;
    await customer.save();

    sendSuccess(res, customer, `Customer account ${customer.isActive ? 'activated' : 'deactivated'}`);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
