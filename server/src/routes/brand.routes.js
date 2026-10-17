const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { protectAdmin } = require('../middleware/auth');

router.get('/', brandController.getBrands);
router.get('/:slug', brandController.getBrand);

router.post('/', protectAdmin, brandController.createBrand);
router.put('/:id', protectAdmin, brandController.updateBrand);
router.delete('/:id', protectAdmin, brandController.deleteBrand);

module.exports = router;
