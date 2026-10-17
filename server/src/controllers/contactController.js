const ContactEnquiry = require('../models/ContactEnquiry');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

exports.submitEnquiry = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return sendError(res, 'Name, email and message are required');
    }

    const enquiry = await ContactEnquiry.create({
      name,
      email,
      phone,
      subject,
      message,
      user: req.user ? req.user._id : undefined
    });

    sendSuccess(res, enquiry, 'Thank you for your enquiry. We will get back to you shortly.', 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.subscribeNewsletter = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return sendError(res, 'Email is required');

    const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
      }
      return sendSuccess(res, null, 'You are subscribed to our newsletter!');
    }

    await NewsletterSubscriber.create({ email: email.toLowerCase(), name });
    sendSuccess(res, null, 'Thank you for subscribing to our newsletter!', 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// Admin
exports.getContactEnquiries = async (req, res) => {
  try {
    const { page = 1, limit = 15, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const pg = parseInt(page);
    const lm = parseInt(limit);
    const skip = (pg - 1) * lm;

    const [enquiries, total] = await Promise.all([
      ContactEnquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(lm).lean(),
      ContactEnquiry.countDocuments(query)
    ]);

    sendPaginated(res, enquiries, total, pg, lm);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const enquiry = await ContactEnquiry.findById(req.params.id);
    if (!enquiry) return sendError(res, 'Enquiry not found', 404);

    if (status) enquiry.status = status;
    if (adminNotes !== undefined) enquiry.adminNotes = adminNotes;
    await enquiry.save();

    sendSuccess(res, enquiry, 'Enquiry updated');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
