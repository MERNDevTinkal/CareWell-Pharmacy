const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protectAdmin } = require('../middleware/auth');

router.use(protectAdmin);

router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomer);
router.patch('/:id/toggle-status', customerController.toggleCustomerStatus);

module.exports = router;
