const slugify = require('slugify');
const Brand = require('../models/Brand');
const { sendSuccess, sendError } = require('../utils/response');

exports.getBrands = async (req, res) => {
  try {
    const { featured } = req.query;
    const query = { isActive: true };
    if (featured === 'true') query.featured = true;
    const brands = await Brand.find(query).sort('name').lean();
    sendSuccess(res, brands);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getBrand = async (req, res) => {
  try {
    const brand = await Brand.findOne({ slug: req.params.slug, isActive: true });
    if (!brand) return sendError(res, 'Brand not found', 404);
    sendSuccess(res, brand);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.createBrand = async (req, res) => {
  try {
    const body = req.body;
    if (!body.slug) body.slug = slugify(body.name, { lower: true, strict: true });
    const brand = await Brand.create(body);
    sendSuccess(res, brand, 'Brand created', 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!brand) return sendError(res, 'Brand not found', 404);
    sendSuccess(res, brand, 'Brand updated');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!brand) return sendError(res, 'Brand not found', 404);
    sendSuccess(res, null, 'Brand deactivated');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.adminGetBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort('name').lean();
    sendSuccess(res, brands);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
