const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { sendSuccess, sendError } = require('../utils/response');

exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      match: { isActive: true },
      populate: [
        { path: 'category', select: 'name slug color' },
        { path: 'brand', select: 'name slug' }
      ]
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    sendSuccess(res, wishlist);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return sendError(res, 'Product ID required');

    const product = await Product.findById(productId);
    if (!product || !product.isActive) return sendError(res, 'Product not found', 404);

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    sendSuccess(res, wishlist, 'Product added to wishlist');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
      await wishlist.save();
    }
    sendSuccess(res, wishlist, 'Product removed from wishlist');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.moveToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return sendError(res, 'Product ID required');

    const product = await Product.findById(productId);
    if (!product || !product.isActive || product.stock < 1) {
      return sendError(res, 'Product is unavailable or out of stock');
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(i => i.product.toString() === productId);
    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += 1;
    } else {
      cart.items.push({
        product: product._id,
        quantity: 1,
        price: product.price,
        mrp: product.mrp,
        name: product.name,
        sku: product.sku,
        image: product.images?.[0]?.url || '',
        prescriptionRequired: product.prescriptionRequired || false
      });
    }
    await cart.save();

    // Remove from wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
      await wishlist.save();
    }

    sendSuccess(res, { cart, wishlist }, 'Product moved to cart');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
