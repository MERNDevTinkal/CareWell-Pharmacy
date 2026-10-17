const slugify = require('slugify');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { sendSuccess, sendError } = require('../utils/response');

exports.getCategories = async (req, res) => {
  try {
    const { parent, featured } = req.query;
    const query = { isVisible: true };
    if (parent === 'null' || parent === '') query.parent = null;
    else if (parent) query.parent = parent;
    if (featured === 'true') query.featured = true;
    const categories = await Category.find(query).sort('displayOrder name').lean();
    sendSuccess(res, categories);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isVisible: true });
    if (!category) return sendError(res, 'Category not found', 404);
    sendSuccess(res, category);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getCategoryTree = async (req, res) => {
  try {
    const all = await Category.find({ isVisible: true }).sort('displayOrder').lean();
    const roots = all.filter(c => !c.parent);
    const tree = roots.map(r => ({
      ...r,
      children: all.filter(c => c.parent && c.parent.toString() === r._id.toString())
    }));
    sendSuccess(res, tree);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.createCategory = async (req, res) => {
  try {
    const body = req.body;
    if (!body.slug) body.slug = slugify(body.name, { lower: true, strict: true });
    const category = await Category.create(body);
    sendSuccess(res, category, 'Category created', 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return sendError(res, 'Category not found', 404);
    sendSuccess(res, category, 'Category updated');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const count = await Product.countDocuments({ category: req.params.id, isActive: true });
    if (count > 0) return sendError(res, `Cannot delete: ${count} active products in this category`);
    await Category.findByIdAndDelete(req.params.id);
    sendSuccess(res, null, 'Category deleted');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.adminGetCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort('displayOrder name').lean();
    sendSuccess(res, categories);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
