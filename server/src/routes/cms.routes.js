const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');
const { protectAdmin } = require('../middleware/auth');

// Pages
router.get('/pages', protectAdmin, cmsController.getAllPages);
router.get('/pages/id/:id', protectAdmin, cmsController.getPageById);
router.get('/pages/:slug', cmsController.getPublicPage);
router.post('/pages', protectAdmin, cmsController.createPage);
router.put('/pages/:id', protectAdmin, cmsController.updatePage);
router.delete('/pages/:id', protectAdmin, cmsController.deletePage);

// FAQs
router.get('/faqs', cmsController.getFAQs);
router.get('/faqs/all', protectAdmin, cmsController.adminGetFAQs);
router.post('/faqs', protectAdmin, cmsController.createFAQ);
router.put('/faqs/:id', protectAdmin, cmsController.updateFAQ);
router.delete('/faqs/:id', protectAdmin, cmsController.deleteFAQ);

// Blogs
router.get('/blogs', cmsController.getBlogs);
router.get('/blogs/admin/all', protectAdmin, cmsController.adminGetBlogs);
router.get('/blogs/:slug', cmsController.getBlog);
router.post('/blogs', protectAdmin, cmsController.createBlog);
router.put('/blogs/:id', protectAdmin, cmsController.updateBlog);
router.delete('/blogs/:id', protectAdmin, cmsController.deleteBlog);

module.exports = router;
