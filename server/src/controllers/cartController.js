const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { sendSuccess, sendError } = require('../utils/response');

const getCartQuery = (req) => {
  if (req.user) return { user: req.user._id };
  const guestId = req.headers['x-guest-id'];
  if (guestId) return { guestId };
  return null;
};

const calculateCartTotals = (cart) => {
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const mrpTotal = cart.items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const savings = mrpTotal - subtotal;
  return { subtotal, mrpTotal, savings };
};

exports.getCart = async (req, res) => {
  try {
    const query = getCartQuery(req);
    if (!query) return sendSuccess(res, { items: [], subtotal: 0 });
    let cart = await Cart.findOne(query).populate('items.product', 'name slug images isActive stock price mrp prescriptionRequired');
    if (!cart) return sendSuccess(res, { items: [], subtotal: 0, couponDiscount: 0 });
    // Remove items for inactive products
    cart.items = cart.items.filter(i => i.product && i.product.isActive);
    const totals = calculateCartTotals(cart);
    sendSuccess(res, { ...cart.toObject(), ...totals });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, variantId } = req.body;
    if (!productId) return sendError(res, 'Product ID required');

    const product = await Product.findById(productId);
    if (!product || !product.isActive) return sendError(res, 'Product not available', 404);
    if (product.stock < 1) return sendError(res, 'Product is out of stock');

    const query = getCartQuery(req);
    if (!query) return sendError(res, 'User or guest ID required');

    let cart = await Cart.findOne(query);
    if (!cart) {
      cart = new Cart(query);
    }

    const existingIndex = cart.items.findIndex(
      i => i.product.toString() === productId && (!variantId || i.variantId?.toString() === variantId)
    );

    if (existingIndex >= 0) {
      const newQty = cart.items[existingIndex].quantity + parseInt(quantity);
      if (newQty > product.stock) return sendError(res, `Only ${product.stock} units available`);
      cart.items[existingIndex].quantity = newQty;
    } else {
      const primaryImage = product.images.find(i => i.isPrimary) || product.images[0];
      cart.items.push({
        product: productId,
        variantId,
        quantity: parseInt(quantity),
        price: product.price,
        mrp: product.mrp,
        name: product.name,
        image: primaryImage?.url,
        sku: product.sku,
        prescriptionRequired: product.prescriptionRequired
      });
    }
    cart.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await cart.save();
    await cart.populate('items.product', 'name slug images isActive stock price mrp prescriptionRequired');
    const totals = calculateCartTotals(cart);
    sendSuccess(res, { ...cart.toObject(), ...totals }, 'Added to cart');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return sendError(res, 'Quantity must be at least 1');
    const query = getCartQuery(req);
    if (!query) return sendError(res, 'Cart not found', 404);
    const cart = await Cart.findOne(query);
    if (!cart) return sendError(res, 'Cart not found', 404);
    const item = cart.items.id(itemId);
    if (!item) return sendError(res, 'Item not found in cart', 404);
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) return sendError(res, 'Product not available');
    if (quantity > product.stock) return sendError(res, `Only ${product.stock} units available`);
    // Revalidate price
    item.price = product.price;
    item.mrp = product.mrp;
    item.quantity = parseInt(quantity);
    await cart.save();
    const totals = calculateCartTotals(cart);
    sendSuccess(res, { ...cart.toObject(), ...totals }, 'Cart updated');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const query = getCartQuery(req);
    if (!query) return sendError(res, 'Cart not found', 404);
    const cart = await Cart.findOne(query);
    if (!cart) return sendError(res, 'Cart not found', 404);
    cart.items.pull({ _id: itemId });
    await cart.save();
    const totals = calculateCartTotals(cart);
    sendSuccess(res, { ...cart.toObject(), ...totals }, 'Item removed');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.clearCart = async (req, res) => {
  try {
    const query = getCartQuery(req);
    if (!query) return sendSuccess(res, null, 'Cart cleared');
    await Cart.findOneAndUpdate(query, { items: [], coupon: null, couponCode: null, couponDiscount: 0 });
    sendSuccess(res, null, 'Cart cleared');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return sendError(res, 'Coupon code required');
    const query = getCartQuery(req);
    if (!query) return sendError(res, 'Cart not found', 404);
    const cart = await Cart.findOne(query);
    if (!cart || cart.items.length === 0) return sendError(res, 'Cart is empty');

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return sendError(res, 'Invalid coupon code');

    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) return sendError(res, 'Coupon is not active yet');
    if (coupon.endDate && now > coupon.endDate) return sendError(res, 'Coupon has expired');
    if (coupon.totalLimit && coupon.usedCount >= coupon.totalLimit) return sendError(res, 'Coupon usage limit reached');

    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    if (subtotal < coupon.minPurchase) return sendError(res, `Minimum purchase of ₹${coupon.minPurchase} required`);

    if (req.user && coupon.perCustomerLimit) {
      const usedByUser = coupon.usedBy.filter(u => u.user.toString() === req.user._id.toString()).length;
      if (usedByUser >= coupon.perCustomerLimit) return sendError(res, 'You have already used this coupon');
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.value;
    }
    discount = Math.min(discount, subtotal);

    cart.coupon = coupon._id;
    cart.couponCode = coupon.code;
    cart.couponDiscount = Math.round(discount);
    await cart.save();
    sendSuccess(res, { couponCode: coupon.code, couponDiscount: cart.couponDiscount, description: coupon.description }, 'Coupon applied');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.removeCoupon = async (req, res) => {
  try {
    const query = getCartQuery(req);
    if (!query) return sendError(res, 'Cart not found', 404);
    await Cart.findOneAndUpdate(query, { coupon: null, couponCode: null, couponDiscount: 0 });
    sendSuccess(res, null, 'Coupon removed');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.mergeCarts = async (req, res) => {
  try {
    const { guestId } = req.body;
    if (!guestId || !req.user) return sendError(res, 'Guest ID and user required');
    const guestCart = await Cart.findOne({ guestId });
    if (!guestCart || guestCart.items.length === 0) return sendSuccess(res, null, 'Nothing to merge');

    let userCart = await Cart.findOne({ user: req.user._id });
    if (!userCart) {
      guestCart.user = req.user._id;
      guestCart.guestId = undefined;
      await guestCart.save();
      return sendSuccess(res, guestCart, 'Cart merged');
    }

    for (const gItem of guestCart.items) {
      const existing = userCart.items.find(i => i.product.toString() === gItem.product.toString());
      if (existing) {
        existing.quantity = Math.min(existing.quantity + gItem.quantity, 99);
      } else {
        userCart.items.push(gItem);
      }
    }
    await userCart.save();
    await Cart.deleteOne({ guestId });
    sendSuccess(res, userCart, 'Carts merged');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
