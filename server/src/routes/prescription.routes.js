const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { protect, protectAdmin } = require('../middleware/auth');
const { uploadPrescriptionFiles } = require('../config/multer');

// Customer
router.post('/upload', protect, uploadPrescriptionFiles.array('files', 5), prescriptionController.uploadPrescription);
router.get('/my', protect, prescriptionController.getMyPrescriptions);

// Admin
router.get('/', protectAdmin, prescriptionController.getPrescriptions);
router.put('/:id/review', protectAdmin, prescriptionController.reviewPrescription);

module.exports = router;
