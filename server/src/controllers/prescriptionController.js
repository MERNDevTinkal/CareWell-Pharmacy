const Prescription = require('../models/Prescription');
const Order = require('../models/Order');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

exports.uploadPrescription = async (req, res) => {
  try {
    let files = [];
    if (req.files && req.files.length > 0) {
      files = req.files.map(f => ({
        url: `/uploads/${f.filename}`,
        filename: f.originalname,
        mimetype: f.mimetype,
        size: f.size
      }));
    } else if (req.body.fileUrl) {
      // Support demo image URL or simulated upload
      files = [{
        url: req.body.fileUrl,
        filename: 'prescription_doc.jpg',
        mimetype: 'image/jpeg',
        size: 102400
      }];
    }

    if (files.length === 0) {
      return sendError(res, 'Please upload at least one prescription document');
    }

    const prescription = await Prescription.create({
      user: req.user._id,
      order: req.body.orderId || undefined,
      files,
      status: 'pending',
      validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 6 months validity
    });

    sendSuccess(res, prescription, 'Prescription uploaded successfully. Our pharmacist will review it.', 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user._id })
      .populate('order', 'orderNumber status totalAmount createdAt')
      .sort({ createdAt: -1 });
    sendSuccess(res, prescriptions);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// Admin Endpoints
exports.getPrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 15, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const pg = parseInt(page);
    const lm = parseInt(limit);
    const skip = (pg - 1) * lm;

    const [prescriptions, total] = await Promise.all([
      Prescription.find(query)
        .populate('user', 'name email phone')
        .populate('order', 'orderNumber status totalAmount items')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lm)
        .lean(),
      Prescription.countDocuments(query)
    ]);

    sendPaginated(res, prescriptions, total, pg, lm);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.reviewPrescription = async (req, res) => {
  try {
    const { status, reviewNote, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return sendError(res, "Status must be 'approved' or 'rejected'");
    }

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return sendError(res, 'Prescription not found', 404);

    prescription.status = status;
    prescription.reviewNote = reviewNote || '';
    if (status === 'rejected') {
      prescription.rejectionReason = rejectionReason || 'Prescription could not be verified';
    }
    prescription.reviewedBy = req.admin?._id;
    prescription.reviewedAt = new Date();
    await prescription.save();

    // If an order is attached, update the order status
    if (prescription.order) {
      const order = await Order.findById(prescription.order);
      if (order) {
        if (status === 'approved' && order.status === 'prescription_review_pending') {
          order.status = 'confirmed';
          order.statusHistory.push({
            status: 'confirmed',
            note: `Prescription approved by pharmacist (${req.admin?.name || 'Pharmacist'}). Order confirmed.`,
            updatedBy: req.admin?._id,
            updatedByModel: 'AdminUser',
            updatedByName: req.admin?.name || 'Pharmacist',
            timestamp: new Date()
          });
          await order.save();
        } else if (status === 'rejected' && order.status === 'prescription_review_pending') {
          order.status = 'cancelled';
          order.cancelReason = `Prescription rejected: ${rejectionReason || reviewNote || 'Invalid prescription'}`;
          order.statusHistory.push({
            status: 'cancelled',
            note: `Order cancelled due to prescription rejection: ${rejectionReason || reviewNote || 'Invalid prescription'}`,
            updatedBy: req.admin?._id,
            updatedByModel: 'AdminUser',
            updatedByName: req.admin?.name || 'Pharmacist',
            timestamp: new Date()
          });
          await order.save();
        }
      }
    }

    sendSuccess(res, prescription, `Prescription ${status} successfully`);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
