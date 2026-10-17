const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { optionalAuth, protectAdmin } = require('../middleware/auth');

router.post('/enquiry', optionalAuth, contactController.submitEnquiry);
router.post('/newsletter', contactController.subscribeNewsletter);

router.get('/enquiries', protectAdmin, contactController.getContactEnquiries);
router.put('/enquiries/:id', protectAdmin, contactController.updateEnquiryStatus);

module.exports = router;
