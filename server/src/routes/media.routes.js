const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { protectAdmin } = require('../middleware/auth');
const { uploadGeneralMedia } = require('../config/multer');

router.use(protectAdmin);

router.get('/', mediaController.getMedia);
router.post('/upload', uploadGeneralMedia.single('file'), mediaController.uploadMedia);
router.put('/:id', mediaController.updateMedia);
router.delete('/:id', mediaController.deleteMedia);

module.exports = router;
