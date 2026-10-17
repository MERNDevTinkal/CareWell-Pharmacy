import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="card p-6 bg-white">
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Explore our health catalog and save items you want to purchase later."
          actionText="Browse Catalog"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="card p-6 bg-white space-y-6">
      <div className="pb-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-navy-900">Saved Wishlist ({wishlist.length})</h1>
        <p className="text-xs text-gray-500">Products you've saved for future refills or orders</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((item) => {
          const product = item._id ? item : null;
          if (!product) return null;

          return (
            <div
              key={product._id}
              className="card p-4 flex flex-col justify-between border border-gray-200 hover:border-primary-200 transition-all shadow-sm"
            >
              <div>
                <img
                  src={product.images?.[0]?.url || 'https://placehold.co/200x200?text=Medicine'}
                  alt={product.name}
                  className="w-full h-36 object-contain rounded-xl bg-gray-50 p-2 mb-3"
                />
                <h3 className="font-bold text-xs text-navy-900 line-clamp-2 mb-1">
                  {product.name}
                </h3>
                <span className="text-sm font-black text-navy-900">₹{product.price}</span>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  onClick={() => addToCart(product._id, 1)}
                  className="btn-primary flex-1 justify-center text-xs py-2"
                >
                  <ShoppingCart size={14} /> Add to Cart
                </button>
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className="p-2 border border-gray-200 text-gray-400 hover:text-rose-500 rounded-xl hover:bg-rose-50"
                  aria-label="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
