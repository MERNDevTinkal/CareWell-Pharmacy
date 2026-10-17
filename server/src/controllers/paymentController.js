const PaymentTransaction = require('../models/PaymentTransaction');
const Order = require('../models/Order');
const { sendSuccess, sendError } = require('../utils/response');

exports.initiatePayment = async (req, res) => {
  try {
    const { orderId, method } = req.body;
    if (!orderId || !method) return sendError(res, 'Order ID and payment method required');

    const order = await Order.findById(orderId);
    if (!order) return sendError(res, 'Order not found', 404);

    if (order.paymentStatus === 'paid') {
      return sendError(res, 'Order is already paid');
    }

    const transactionRef = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const transaction = await PaymentTransaction.create({
      order: order._id,
      user: req.user ? req.user._id : order.user,
      amount: order.totalAmount,
      currency: 'INR',
      method,
      status: 'pending',
      transactionRef,
      gatewayResponse: {
        mode: 'DEMO_SIMULATION',
        initiatedAt: new Date(),
        message: 'This is a simulated payment gateway. No real money is charged.'
      }
    });

    order.paymentTransaction = transaction._id;
    order.paymentMethod = method;
    await order.save();

    sendSuccess(res, {
      transactionRef,
      orderId: order._id,
      amount: order.totalAmount,
      currency: 'INR',
      method,
      status: 'pending',
      demoInstructions: 'Select simulated outcome: success, failure, or pending.'
    }, 'Payment initiated (Demo Mode)');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { transactionRef, simulationOutcome = 'success', mockCardNumber, mockUpiId } = req.body;
    if (!transactionRef) return sendError(res, 'Transaction reference required');

    const transaction = await PaymentTransaction.findOne({ transactionRef });
    if (!transaction) return sendError(res, 'Transaction not found', 404);

    const order = await Order.findById(transaction.order);
    if (!order) return sendError(res, 'Associated order not found', 404);

    if (simulationOutcome === 'success') {
      transaction.status = 'success';
      transaction.gatewayResponse = {
        mode: 'DEMO_SIMULATION',
        status: 'SUCCESS',
        paymentId: `PAY-${Date.now()}`,
        verifiedAt: new Date(),
        identifier: mockUpiId || (mockCardNumber ? `Card ending in ${mockCardNumber.slice(-4)}` : 'Demo Account')
      };
      await transaction.save();

      order.paymentStatus = 'paid';
      if (order.status === 'pending_confirmation') {
        order.status = 'confirmed';
        order.statusHistory.push({
          status: 'confirmed',
          note: `Payment verified via ${transaction.method}. Order confirmed.`,
          updatedByName: 'System (Payment Gateway)',
          timestamp: new Date()
        });
      }
      await order.save();

      return sendSuccess(res, {
        order,
        transaction,
        message: 'Payment completed successfully (Demo Mode)'
      });
    } else if (simulationOutcome === 'failure') {
      transaction.status = 'failed';
      transaction.gatewayResponse = {
        mode: 'DEMO_SIMULATION',
        status: 'FAILED',
        error: 'Simulated payment failure (user declined or insufficient funds)'
      };
      await transaction.save();

      order.paymentStatus = 'failed';
      order.statusHistory.push({
        status: order.status,
        note: `Payment attempt failed via ${transaction.method}.`,
        updatedByName: 'System (Payment Gateway)',
        timestamp: new Date()
      });
      await order.save();

      return sendError(res, 'Simulated payment failed. You can retry with another method.');
    } else {
      transaction.status = 'pending';
      await transaction.save();
      return sendSuccess(res, { order, transaction, message: 'Payment is pending verification' });
    }
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.retryPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return sendError(res, 'Order not found', 404);

    if (order.paymentStatus === 'paid') {
      return sendError(res, 'Order has already been paid');
    }

    const transactionRef = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const transaction = await PaymentTransaction.create({
      order: order._id,
      user: req.user ? req.user._id : order.user,
      amount: order.totalAmount,
      currency: 'INR',
      method: order.paymentMethod,
      status: 'pending',
      transactionRef,
      gatewayResponse: { mode: 'DEMO_SIMULATION', retry: true, initiatedAt: new Date() }
    });

    order.paymentTransaction = transaction._id;
    order.paymentStatus = 'pending';
    await order.save();

    sendSuccess(res, { transactionRef, orderId: order._id, amount: order.totalAmount }, 'Retry payment initiated');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.processRefund = async (req, res) => {
  try {
    const { orderId, amount, note } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return sendError(res, 'Order not found', 404);

    const refundAmount = amount || order.totalAmount;

    const transaction = await PaymentTransaction.findOne({ order: order._id, status: 'success' });
    if (transaction) {
      transaction.status = 'refunded';
      transaction.refundedAt = new Date();
      transaction.refundAmount = refundAmount;
      transaction.notes = note || 'Admin approved refund';
      await transaction.save();
    }

    order.paymentStatus = 'refunded';
    order.status = 'refunded';
    order.statusHistory.push({
      status: 'refunded',
      note: `Refund of ₹${refundAmount} processed (Demo Simulation). Note: ${note || 'Admin approval'}`,
      updatedBy: req.admin?._id,
      updatedByModel: 'AdminUser',
      updatedByName: req.admin?.name || 'Administrator',
      timestamp: new Date()
    });
    await order.save();

    sendSuccess(res, { order, transaction }, `Refund of ₹${refundAmount} processed successfully`);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
