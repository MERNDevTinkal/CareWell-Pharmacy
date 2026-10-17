const express = require('express');
const router = express.Router();
const homepageController = require('../controllers/homepageController');
const { protectAdmin } = require('../middleware/auth');

router.get('/sections', homepageController.getHomepageSections);
router.get('/admin/sections', protectAdmin, homepageController.adminGetSections);
router.post('/sections', protectAdmin, homepageController.createSection);
router.put('/sections/reorder', protectAdmin, homepageController.reorderSections);
router.put('/sections/:id', protectAdmin, homepageController.updateSection);
router.delete('/sections/:id', protectAdmin, homepageController.deleteSection);

module.exports = router;
