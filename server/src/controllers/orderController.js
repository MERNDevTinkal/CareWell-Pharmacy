const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const StoreSetting = require('../models/StoreSetting');
const StockMovement = require('../models/StockMovement');
const Prescription = require('../models/Prescription');
const generateOrderNumber = require('../utils/generateOrderNumber');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

exports.createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod = 'cod',
      prescriptionId,
      customerInfo,
      notes
    } = req.body;

    if (!shippingAddress || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.pincode) {
      return sendError(res, 'Valid shipping address is required');
    }

    // Get cart
    const cartQuery = req.user ? { user: req.user._id } : { guestId: req.headers['x-guest-id'] };
    const cart = await Cart.findOne(cartQuery).populate('items.product');

    if (!cart || !cart.items || cart.items.length === 0) {
      return sendError(res, 'Your cart is empty');
    }

    let subtotal = 0;
    let requiresPrescription = false;
    const orderItems = [];

    // Verify inventory and recalculate real prices from DB
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id || item.product);
      if (!product || !product.isActive) {
        return sendError(res, `Product ${item.name || 'item'} is no longer available`);
      }
      if (product.stock < item.quantity) {
        return sendError(res, `Not enough stock for ${product.name}. Available: ${product.stock}`);
      }
      if (product.prescriptionRequired) {
        requiresPrescription = true;
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        productName: product.name,
        productSlug: product.slug,
        sku: product.sku,
        brand: product.brand ? product.brand.toString() : '',
        image: product.images?.[0]?.url || '',
        price: product.price,
        mrp: product.mrp,
        discount: product.discount || 0,
        quantity: item.quantity,
        prescriptionRequired: product.prescriptionRequired || false,
        variantName: item.variantName || ''
      });
    }

    // Prescription validation
    if (requiresPrescription) {
      if (!prescriptionId) {
        return sendError(res, 'Order contains prescription-required medicines. Please upload or attach a prescription.');
      }
      const pres = await Prescription.findById(prescriptionId);
      if (!pres) {
        return sendError(res, 'Invalid prescription attached');
      }
    }

    // Settings for shipping and tax
    const settings = await StoreSetting.find({ key: { $in: ['shippingCharge', 'freeShippingThreshold', 'taxRate'] } });
    const settingsMap = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });

    const shippingCharge = (subtotal >= (settingsMap.freeShippingThreshold || 599)) ? 0 : (settingsMap.shippingCharge || 49);
    let couponDiscount = 0;
    let couponCode = '';

    if (cart.coupon) {
      const coupon = await Coupon.findById(cart.coupon);
      if (coupon && coupon.isActive) {
        if (coupon.type === 'percentage') {
          couponDiscount = (subtotal * coupon.value) / 100;
          if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
            couponDiscount = coupon.maxDiscount;
          }
        } else {
          couponDiscount = coupon.value;
        }
        couponCode = coupon.code;
        coupon.usedCount = (coupon.usedCount || 0) + 1;
        if (req.user) {
          coupon.usedBy.push({ user: req.user._id, usedAt: new Date() });
        }
        await coupon.save();
      }
    }

    const taxAmount = Math.round(((subtotal - couponDiscount) * (settingsMap.taxRate || 12)) / 100);
    const totalAmount = Math.max(0, subtotal - couponDiscount + shippingCharge);

    const initialStatus = requiresPrescription ? 'prescription_review_pending' : 'pending_confirmation';

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      user: req.user ? req.user._id : undefined,
      guestId: !req.user ? req.headers['x-guest-id'] : undefined,
      customerInfo: customerInfo || {
        name: shippingAddress.name,
        email: req.user?.email || shippingAddress.email || '',
        phone: shippingAddress.phone
      },
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingCharge,
      couponCode,
      couponDiscount,
      taxAmount,
      totalAmount,
      status: initialStatus,
      statusHistory: [{
        status: initialStatus,
        note: requiresPrescription ? 'Order placed. Awaiting pharmacist prescription review.' : 'Order placed successfully.',
        updatedByName: req.user?.name || customerInfo?.name || 'Customer',
        timestamp: new Date()
      }],
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      paymentMethod,
      prescription: prescriptionId || undefined,
      requiresPrescription,
      notes: notes || ''
    });

    // Reduce inventory and log stock movement
    for (const item of orderItems) {
      const prod = await Product.findById(item.product);
      if (prod) {
        const previousStock = prod.stock;
        prod.stock = Math.max(0, prod.stock - item.quantity);
        prod.salesCount = (prod.salesCount || 0) + item.quantity;
        await prod.save();

        await StockMovement.create({
          product: prod._id,
          type: 'out',
          quantity: item.quantity,
          previousStock,
          newStock: prod.stock,
          reason: 'Order placed',
          reference: orderNumber,
          note: `Order ${orderNumber}`
        });
      }
    }

    // Link prescription to order if applicable
    if (prescriptionId) {
      await Prescription.findByIdAndUpdate(prescriptionId, { order: order._id });
    }

    // Clear cart
    cart.items = [];
    cart.coupon = null;
    cart.couponCode = '';
    cart.couponDiscount = 0;
    await cart.save();

    sendSuccess(res, order, 'Order created successfully', 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const pg = parseInt(page);
    const lm = parseInt(limit);
    const skip = (pg - 1) * lm;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(lm).lean(),
      Order.countDocuments(query)
    ]);

    sendPaginated(res, orders, total, pg, lm);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getMyOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate('prescription')
      .populate('paymentTransaction');
    if (!order) return sendError(res, 'Order not found', 404);
    sendSuccess(res, order);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { reason = 'Cancelled by customer' } = req.body;
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return sendError(res, 'Order not found', 404);

    const cancellableStatuses = ['pending_confirmation', 'prescription_review_pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      return sendError(res, `Order cannot be cancelled in '${order.status}' state`);
    }

    order.status = 'cancelled';
    order.cancelReason = reason;
    order.statusHistory.push({
      status: 'cancelled',
      note: `Cancelled: ${reason}`,
      updatedByName: req.user.name,
      timestamp: new Date()
    });
    await order.save();

    // Restock inventory
    for (const item of order.items) {
      const prod = await Product.findById(item.product);
      if (prod) {
        const previousStock = prod.stock;
        prod.stock += item.quantity;
        await prod.save();

        await StockMovement.create({
          product: prod._id,
          type: 'return',
          quantity: item.quantity,
          previousStock,
          newStock: prod.stock,
          reason: 'Customer cancelled order',
          reference: order.orderNumber
        });
      }
    }

    sendSuccess(res, order, 'Order cancelled successfully');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.requestReturn = async (req, res) => {
  try {
    const { reason, items } = req.body;
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return sendError(res, 'Order not found', 404);

    if (order.status !== 'delivered') {
      return sendError(res, 'Returns can only be requested for delivered orders');
    }

    order.status = 'return_requested';
    order.statusHistory.push({
      status: 'return_requested',
      note: `Return requested: ${reason || 'Customer request'}`,
      updatedByName: req.user.name,
      timestamp: new Date()
    });
    await order.save();

    sendSuccess(res, order, 'Return requested successfully');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// Admin Endpoints
exports.getOrders = async (req, res) => {
  try {
    const {
      page = 1, limit = 15, search, status,
      paymentStatus, startDate, endDate, sort = '-createdAt'
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { orderNumber: new RegExp(search, 'i') },
        { 'customerInfo.name': new RegExp(search, 'i') },
        { 'customerInfo.email': new RegExp(search, 'i') },
        { 'shippingAddress.phone': new RegExp(search, 'i') }
      ];
    }

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const pg = parseInt(page);
    const lm = parseInt(limit);
    const skip = (pg - 1) * lm;

    const [orders, total] = await Promise.all([
      Order.find(query).populate('user', 'name email phone').sort(sort).skip(skip).limit(lm).lean(),
      Order.countDocuments(query)
    ]);

    sendPaginated(res, orders, total, pg, lm);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('prescription')
      .populate('paymentTransaction');
    if (!order) return sendError(res, 'Order not found', 404);
    sendSuccess(res, order);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return sendError(res, 'Order not found', 404);

    const validTransitions = {
      pending_confirmation: ['confirmed', 'cancelled', 'processing'],
      prescription_review_pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['packed', 'cancelled'],
      packed: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: ['return_requested'],
      return_requested: ['returned', 'delivered'],
      returned: ['refund_pending', 'refunded'],
      refund_pending: ['refunded'],
      cancelled: [],
      refunded: []
    };

    const allowed = validTransitions[order.status] || [];
    if (!allowed.includes(status)) {
      return sendError(res, `Cannot transition from '${order.status}' to '${status}'. Allowed: ${allowed.join(', ')}`);
    }

    order.status = status;
    if (status === 'delivered') order.deliveredAt = new Date();

    order.statusHistory.push({
      status,
      note: note || `Status updated to ${status}`,
      updatedBy: req.admin?._id,
      updatedByModel: 'AdminUser',
      updatedByName: req.admin?.name || 'Administrator',
      timestamp: new Date()
    });

    await order.save();
    sendSuccess(res, order, `Order status updated to ${status}`);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.addTracking = async (req, res) => {
  try {
    const { courier, trackingNumber, trackingUrl, estimatedDelivery } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return sendError(res, 'Order not found', 404);

    order.courier = courier;
    order.trackingNumber = trackingNumber;
    order.trackingUrl = trackingUrl;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);

    if (order.status === 'packed' || order.status === 'confirmed') {
      order.status = 'shipped';
      order.statusHistory.push({
        status: 'shipped',
        note: `Shipped via ${courier} (Tracking: ${trackingNumber})`,
        updatedBy: req.admin?._id,
        updatedByModel: 'AdminUser',
        updatedByName: req.admin?.name || 'Administrator',
        timestamp: new Date()
      });
    }

    await order.save();
    sendSuccess(res, order, 'Tracking information updated');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return sendError(res, 'Order not found', 404);

    const settings = await StoreSetting.find({ key: { $in: ['storeName', 'contactAddress', 'contactPhone', 'contactEmail', 'taxRate'] } });
    const storeInfo = {};
    settings.forEach(s => { storeInfo[s.key] = s.value; });

    const invoice = {
      invoiceNumber: order.invoiceNumber || `INV-${order.orderNumber}`,
      invoiceDate: order.createdAt,
      orderNumber: order.orderNumber,
      store: storeInfo,
      customer: order.customerInfo,
      shippingAddress: order.shippingAddress,
      items: order.items,
      subtotal: order.subtotal,
      shippingCharge: order.shippingCharge,
      couponDiscount: order.couponDiscount,
      taxAmount: order.taxAmount,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus
    };

    sendSuccess(res, invoice);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
