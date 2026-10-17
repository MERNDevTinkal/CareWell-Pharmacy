import api from './api';

export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity, variantId) => api.post('/cart/add', { productId, quantity, variantId }),
  updateCartItem: (itemId, quantity) => api.put(`/cart/item/${itemId}`, { quantity }),
  removeCartItem: (itemId) => api.delete(`/cart/item/${itemId}`),
  clearCart: () => api.delete('/cart/clear'),
  applyCoupon: (code) => api.post('/cart/coupon', { code }),
  removeCoupon: () => api.delete('/cart/coupon'),
  mergeCarts: () => api.post('/cart/merge'),
};
