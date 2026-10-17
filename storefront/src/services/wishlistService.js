import api from './api';

export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (productId) => api.post('/wishlist/add', { productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
  moveToCart: (productId) => api.post('/wishlist/move-to-cart', { productId }),
};
