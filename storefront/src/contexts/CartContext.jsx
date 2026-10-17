import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], subtotal: 0, total: 0, couponDiscount: 0, shippingCharge: 0 });
  const [loading, setLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const res = await cartService.getCart();
      setCart(res.data.data || { items: [], subtotal: 0, total: 0, couponDiscount: 0, shippingCharge: 0 });
    } catch (e) {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1, variantId = null) => {
    setLoading(true);
    try {
      await cartService.addToCart(productId, quantity, variantId);
      await fetchCart();
      setCartOpen(true);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      await cartService.updateCartItem(itemId, quantity);
      await fetchCart();
    } catch (err) {
      toast.error(err.message || 'Failed to update cart');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await cartService.removeCartItem(itemId);
      await fetchCart();
      toast.success('Removed from cart');
    } catch (err) {
      toast.error(err.message || 'Failed to remove item');
    }
  };

  const applyCoupon = async (code) => {
    try {
      await cartService.applyCoupon(code);
      await fetchCart();
      toast.success('Coupon applied!');
    } catch (err) {
      toast.error(err.message || 'Invalid coupon');
      throw err;
    }
  };

  const removeCoupon = async () => {
    try {
      await cartService.removeCoupon();
      await fetchCart();
      toast.success('Coupon removed');
    } catch (e) {
      /* ignore */
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      await fetchCart();
    } catch (e) {
      /* ignore */
    }
  };

  const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const hasPrescriptionItems = cart.items?.some(item => item.product?.prescriptionRequired || item.prescriptionRequired) || false;

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      cartOpen,
      setCartOpen,
      addToCart,
      updateItem,
      removeItem,
      applyCoupon,
      removeCoupon,
      clearCart,
      fetchCart,
      itemCount,
      hasPrescriptionItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
