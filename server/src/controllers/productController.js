const slugify = require('slugify');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const path = require('path');

exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, sort = '-createdAt', search,
      category, brand, minPrice, maxPrice,
      prescriptionRequired, inStock, featured, bestSeller, isNew
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
    }
    if (brand) query.brand = brand;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (prescriptionRequired !== undefined) query.prescriptionRequired = prescriptionRequired === 'true';
    if (inStock === 'true') query.stock = { $gt: 0 };
    if (featured === 'true') query.isFeatured = true;
    if (bestSeller === 'true') query.isBestSeller = true;
    if (isNew === 'true') query.isNew = true;

    const pg = parseInt(page);
    const lm = parseInt(limit);
    const skip = (pg - 1) * lm;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug color')
        .populate('brand', 'name slug logo')
        .sort(sort)
        .skip(skip)
        .limit(lm)
        .lean(),
      Product.countDocuments(query)
    ]);

    sendPaginated(res, products, total, pg, lm);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug color')
      .populate('brand', 'name slug logo')
      .populate('relatedProducts', 'name slug images price mrp discount isBestSeller reviewSummary');
    if (!product) return sendError(res, 'Product not found', 404);
    // Increment view count async
    Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } }).exec();
    sendSuccess(res, product);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate('category', 'name slug')
      .populate('brand', 'name slug')
      .limit(limit).lean();
    sendSuccess(res, products);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getBestSellers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.find({ isActive: true, isBestSeller: true })
      .populate('category', 'name slug')
      .populate('brand', 'name slug')
      .sort('-salesCount').limit(limit).lean();
    sendSuccess(res, products);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getNewArrivals = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.find({ isActive: true, isNew: true })
      .populate('category', 'name slug')
      .populate('brand', 'name slug')
      .sort('-createdAt').limit(limit).lean();
    sendSuccess(res, products);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return sendError(res, 'Product not found', 404);
    const related = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true
    }).limit(6).lean();
    sendSuccess(res, related);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q || q.trim().length < 2) return sendSuccess(res, []);
    const products = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { sku: { $regex: q, $options: 'i' } }
      ]
    })
      .select('name slug images price mrp discount prescriptionRequired category brand')
      .populate('category', 'name slug')
      .populate('brand', 'name')
      .limit(parseInt(limit)).lean();
    sendSuccess(res, products);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.createProduct = async (req, res) => {
  try {
    const body = req.body;
    if (!body.slug) {
      body.slug = slugify(body.name, { lower: true, strict: true });
    }
    // Ensure unique slug
    const exists = await Product.findOne({ slug: body.slug });
    if (exists) body.slug = `${body.slug}-${Date.now()}`;
    const product = await Product.create(body);
    // Update category productCount
    if (body.category) {
      await Category.findByIdAndUpdate(body.category, { $inc: { productCount: 1 } });
    }
    sendSuccess(res, product, 'Product created', 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('category', 'name slug')
      .populate('brand', 'name slug');
    if (!product) return sendError(res, 'Product not found', 404);
    sendSuccess(res, product, 'Product updated');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return sendError(res, 'Product not found', 404);
    sendSuccess(res, null, 'Product removed');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return sendError(res, 'No images uploaded');
    const images = req.files.map((file, idx) => ({
      url: `/uploads/products/${file.filename}`,
      alt: file.originalname,
      isPrimary: idx === 0,
      order: idx
    }));
    sendSuccess(res, images, 'Images uploaded');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.toggleFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendError(res, 'Product not found', 404);
    product.isFeatured = !product.isFeatured;
    await product.save();
    sendSuccess(res, { isFeatured: product.isFeatured }, `Product ${product.isFeatured ? 'featured' : 'unfeatured'}`);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.toggleBestSeller = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendError(res, 'Product not found', 404);
    product.isBestSeller = !product.isBestSeller;
    await product.save();
    sendSuccess(res, { isBestSeller: product.isBestSeller }, `Best seller ${product.isBestSeller ? 'enabled' : 'disabled'}`);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.adminGetProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, brand, isActive, prescriptionRequired } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (prescriptionRequired !== undefined) query.prescriptionRequired = prescriptionRequired === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    const pg = parseInt(page), lm = parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('brand', 'name slug')
        .sort('-createdAt').skip((pg - 1) * lm).limit(lm).lean(),
      Product.countDocuments(query)
    ]);
    sendPaginated(res, products, total, pg, lm);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
