const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const InventoryBatch = require('../models/InventoryBatch');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

exports.getInventory = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, lowStock } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { sku: new RegExp(search, 'i') }
      ];
    }
    if (category) query.category = category;
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    }

    const pg = parseInt(page);
    const lm = parseInt(limit);
    const skip = (pg - 1) * lm;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name')
        .populate('brand', 'name')
        .select('name sku stock lowStockThreshold price mrp category brand images')
        .sort({ stock: 1 })
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

exports.adjustStock = async (req, res) => {
  try {
    const { productId, type = 'adjustment', quantity, reason, note } = req.body;
    if (!productId || quantity === undefined) {
      return sendError(res, 'Product ID and quantity are required');
    }

    const product = await Product.findById(productId);
    if (!product) return sendError(res, 'Product not found', 404);

    const qty = parseInt(quantity);
    const previousStock = product.stock;
    let newStock = previousStock;

    if (type === 'in' || type === 'return') {
      newStock += Math.abs(qty);
    } else if (type === 'out') {
      newStock = Math.max(0, previousStock - Math.abs(qty));
    } else { // adjustment to absolute quantity
      newStock = Math.max(0, qty);
    }

    product.stock = newStock;
    await product.save();

    const movement = await StockMovement.create({
      product: product._id,
      type,
      quantity: Math.abs(newStock - previousStock),
      previousStock,
      newStock,
      reason: reason || 'Manual adjustment',
      performedBy: req.admin?._id,
      note: note || ''
    });

    sendSuccess(res, { product, movement }, 'Stock adjusted successfully');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getStockMovements = async (req, res) => {
  try {
    const { page = 1, limit = 20, productId, type } = req.query;
    const query = {};
    if (productId) query.product = productId;
    if (type) query.type = type;

    const pg = parseInt(page);
    const lm = parseInt(limit);
    const skip = (pg - 1) * lm;

    const [movements, total] = await Promise.all([
      StockMovement.find(query)
        .populate('product', 'name sku')
        .populate('performedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lm)
        .lean(),
      StockMovement.countDocuments(query)
    ]);

    sendPaginated(res, movements, total, pg, lm);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getBatches = async (req, res) => {
  try {
    const { page = 1, limit = 20, productId } = req.query;
    const query = {};
    if (productId) query.product = productId;

    const pg = parseInt(page);
    const lm = parseInt(limit);
    const skip = (pg - 1) * lm;

    const [batches, total] = await Promise.all([
      InventoryBatch.find(query)
        .populate('product', 'name sku')
        .sort({ expiryDate: 1 })
        .skip(skip)
        .limit(lm)
        .lean(),
      InventoryBatch.countDocuments(query)
    ]);

    sendPaginated(res, batches, total, pg, lm);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.createBatch = async (req, res) => {
  try {
    const batch = await InventoryBatch.create(req.body);
    sendSuccess(res, batch, 'Batch created', 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateBatch = async (req, res) => {
  try {
    const batch = await InventoryBatch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!batch) return sendError(res, 'Batch not found', 404);
    sendSuccess(res, batch, 'Batch updated');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getLowStockAlerts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    })
      .populate('category', 'name')
      .select('name sku stock lowStockThreshold images');
    sendSuccess(res, products);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getNearExpiryAlerts = async (req, res) => {
  try {
    const ninetyDaysAhead = new Date();
    ninetyDaysAhead.setDate(ninetyDaysAhead.getDate() + 90);

    const batches = await InventoryBatch.find({
      isActive: true,
      expiryDate: { $lte: ninetyDaysAhead, $gte: new Date() }
    })
      .populate('product', 'name sku')
      .sort({ expiryDate: 1 });

    sendSuccess(res, batches);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
