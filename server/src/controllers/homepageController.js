const HomePageSection = require('../models/HomePageSection');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { sendSuccess, sendError } = require('../utils/response');

exports.getHomepageSections = async (req, res) => {
  try {
    const sections = await HomePageSection.find({ isVisible: true })
      .sort({ displayOrder: 1 })
      .populate({
        path: 'products',
        match: { isActive: true },
        select: 'name slug images price mrp discount stock isFeatured isBestSeller prescriptionRequired rating brand category',
        populate: [
          { path: 'category', select: 'name slug color' },
          { path: 'brand', select: 'name slug' }
        ]
      })
      .populate('categories', 'name slug image icon color productCount')
      .lean();

    // For sections that use productFilter instead of explicit product IDs, fetch dynamically
    for (const section of sections) {
      if (['featured_products', 'best_sellers', 'wellness_collection', 'offers', 'new_arrivals'].includes(section.type)) {
        if (!section.products || section.products.length === 0) {
          const filter = { isActive: true };
          if (section.type === 'featured_products') filter.isFeatured = true;
          if (section.type === 'best_sellers') filter.isBestSeller = true;
          if (section.type === 'wellness_collection') filter.isNew = true;
          if (section.productFilter?.category) filter.category = section.productFilter.category;

          const limit = section.productFilter?.limit || 8;
          section.products = await Product.find(filter)
            .populate('category', 'name slug color')
            .populate('brand', 'name slug')
            .limit(limit)
            .lean();
        }
      }

      if (section.type === 'category_collection' && (!section.categories || section.categories.length === 0)) {
        section.categories = await Category.find({ isVisible: true })
          .sort({ displayOrder: 1 })
          .limit(10)
          .lean();
      }
    }

    sendSuccess(res, sections);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.adminGetSections = async (req, res) => {
  try {
    const sections = await HomePageSection.find()
      .sort({ displayOrder: 1 })
      .populate('products', 'name slug')
      .populate('categories', 'name slug');
    sendSuccess(res, sections);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.createSection = async (req, res) => {
  try {
    const count = await HomePageSection.countDocuments();
    const section = await HomePageSection.create({
      ...req.body,
      displayOrder: req.body.displayOrder !== undefined ? req.body.displayOrder : count + 1
    });
    sendSuccess(res, section, 'Homepage section created', 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateSection = async (req, res) => {
  try {
    const section = await HomePageSection.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!section) return sendError(res, 'Section not found', 404);
    sendSuccess(res, section, 'Section updated');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const section = await HomePageSection.findById(req.params.id);
    if (!section) return sendError(res, 'Section not found', 404);
    await section.deleteOne();
    sendSuccess(res, null, 'Section deleted');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.reorderSections = async (req, res) => {
  try {
    const { orders } = req.body; // array of { id, displayOrder }
    if (!Array.isArray(orders)) return sendError(res, 'Orders array required');

    const bulkOps = orders.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { displayOrder: item.displayOrder }
      }
    }));

    await HomePageSection.bulkWrite(bulkOps);
    sendSuccess(res, null, 'Sections reordered successfully');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
