const Media = require('../models/Media');
const Product = require('../models/Product');
const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file && (!req.files || req.files.length === 0)) {
      return sendError(res, 'No files uploaded');
    }

    const files = req.files || [req.file];
    const createdMedia = [];

    for (const f of files) {
      const media = await Media.create({
        filename: f.filename,
        originalName: f.originalname,
        url: `/uploads/${f.filename}`,
        mimetype: f.mimetype,
        size: f.size,
        alt: req.body.alt || f.originalname,
        folder: req.body.folder || 'general',
        uploadedBy: req.admin?._id
      });
      createdMedia.push(media);
    }

    sendSuccess(res, createdMedia.length === 1 ? createdMedia[0] : createdMedia, 'Media uploaded successfully', 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getMedia = async (req, res) => {
  try {
    const { page = 1, limit = 24, folder, search } = req.query;
    const query = {};
    if (folder) query.folder = folder;
    if (search) query.originalName = new RegExp(search, 'i');

    const pg = parseInt(page);
    const lm = parseInt(limit);
    const skip = (pg - 1) * lm;

    const [mediaList, total] = await Promise.all([
      Media.find(query).sort({ createdAt: -1 }).skip(skip).limit(lm).lean(),
      Media.countDocuments(query)
    ]);

    sendPaginated(res, mediaList, total, pg, lm);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateMedia = async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!media) return sendError(res, 'Media not found', 404);
    sendSuccess(res, media, 'Media updated');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return sendError(res, 'Media not found', 404);

    // Try deleting file from disk
    const filePath = path.join(__dirname, '../../uploads', media.filename);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    }

    await media.deleteOne();
    sendSuccess(res, null, 'Media deleted successfully');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
