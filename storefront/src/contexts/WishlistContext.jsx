import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      const res = await wishlistService.getWishlist();
      setWishlist(res.data?.data?.products || []);
    } catch (e) {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (productId) => {
    if (!user) {
      toast.error('Please login to save to your wishlist');
      return;
    }
    const isIn = wishlist.some(p => (p._id || p) === productId);
    try {
      if (isIn) {
        await wishlistService.removeFromWishlist(productId);
        setWishlist(prev => prev.filter(p => (p._id || p) !== productId));
        toast.success('Removed from wishlist');
      } else {
        await wishlistService.addToWishlist(productId);
        await fetchWishlist();
        toast.success('Added to wishlist!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update wishlist');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(p => (p._id || p) === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
