const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protectAdmin } = require('../middleware/auth');

router.get('/', categoryController.getCategories);
router.get('/tree', categoryController.getCategoryTree);
router.get('/:slug', categoryController.getCategory);

router.post('/', protectAdmin, categoryController.createCategory);
router.put('/:id', protectAdmin, categoryController.updateCategory);
router.delete('/:id', protectAdmin, categoryController.deleteCategory);

module.exports = router;
