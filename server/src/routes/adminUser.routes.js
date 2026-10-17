const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');
const { protectAdmin, authorize } = require('../middleware/auth');

router.use(protectAdmin);
router.use(authorize('super_admin'));

router.get('/', adminUserController.getAdminUsers);
router.post('/', adminUserController.createAdminUser);
router.put('/:id', adminUserController.updateAdminUser);
router.delete('/:id', adminUserController.deleteAdminUser);
router.patch('/:id/toggle-status', adminUserController.toggleAdminStatus);

module.exports = router;
