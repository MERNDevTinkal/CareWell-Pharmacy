const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const { protectAdmin } = require('../middleware/auth');

router.post('/login', adminAuthController.adminLogin);
router.get('/profile', protectAdmin, adminAuthController.getAdminProfile);
router.put('/profile', protectAdmin, adminAuthController.updateAdminProfile);
router.put('/change-password', protectAdmin, adminAuthController.changeAdminPassword);

module.exports = router;
