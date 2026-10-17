const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Prescription = require('../models/Prescription');
const ContactEnquiry = require('../models/ContactEnquiry');
const StockMovement = require('../models/StockMovement');
const { sendSuccess, sendError } = require('../utils/response');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      salesAgg,
      totalOrders,
      todayOrders,
      pendingOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      pendingPrescriptions,
      pendingEnquiries
    ] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ status: { $in: ['pending_confirmation', 'prescription_review_pending'] } }),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, $expr: { $lte: ['$stock', '$lowStockThreshold'] } }),
      Prescription.countDocuments({ status: 'pending' }),
      ContactEnquiry.countDocuments({ status: 'new' })
    ]);

    const totalSales = salesAgg[0]?.total || 0;

    sendSuccess(res, {
      totalSales,
      totalOrders,
      todayOrders,
      pendingOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      pendingPrescriptions,
      pendingEnquiries
    });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getSalesChart = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const salesByDate = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    sendSuccess(res, salesByDate);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getBestSellingProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ salesCount: -1 })
      .limit(5)
      .populate('category', 'name')
      .select('name slug price mrp stock salesCount images');
    sendSuccess(res, products);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber customerInfo totalAmount status paymentStatus createdAt');
    sendSuccess(res, orders);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const movements = await StockMovement.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('product', 'name');
    sendSuccess(res, movements);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
