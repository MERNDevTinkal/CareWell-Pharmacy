const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protectAdmin } = require('../middleware/auth');

router.get('/public', settingsController.getPublicSettings);
router.get('/navigation', settingsController.getNavigation);

router.get('/all', protectAdmin, settingsController.getAllSettings);
router.put('/', protectAdmin, settingsController.updateSettings);
router.get('/navigation/all', protectAdmin, settingsController.adminGetNavigation);
router.put('/navigation', protectAdmin, settingsController.updateNavigation);

module.exports = router;
