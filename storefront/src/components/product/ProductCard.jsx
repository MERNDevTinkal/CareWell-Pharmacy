import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, ShieldAlert } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  const isFav = isInWishlist(product._id);
  const inStock = product.stock > 0;
  const image = product.images?.[0]?.url || 'https://placehold.co/600x600?text=Medicine';

  return (
    <div className="card group relative flex flex-col justify-between hover:shadow-xl hover:border-primary-100 transition-all duration-300">
      {/* Badges Container */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.discount > 0 && (
          <span className="badge bg-green-500 text-white font-bold text-[10px] shadow-sm">
            {product.discount}% OFF
          </span>
        )}
        {product.prescriptionRequired && (
          <span className="badge bg-amber-500 text-white font-bold text-[10px] shadow-sm flex items-center gap-1">
            <ShieldAlert size={10} /> Rx
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product._id);
        }}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all ${
          isFav
            ? 'bg-rose-50 text-rose-500'
            : 'bg-white/80 text-gray-400 hover:text-rose-500 hover:bg-white shadow-sm'
        }`}
        aria-label="Toggle Wishlist"
      >
        <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
      </button>

      {/* Image Container */}
      <Link
        to={`/products/${product.slug}`}
        className="block p-4 bg-gray-50/50 rounded-t-2xl overflow-hidden aspect-square flex items-center justify-center group-hover:bg-primary-50/30 transition-colors"
      >
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold mb-1">
            <span className="truncate max-w-[120px]">{product.brand?.name || 'CareWell'}</span>
            <span className="text-primary-600">{product.category?.name}</span>
          </div>

          <Link to={`/products/${product.slug}`}>
            <h3 className="text-sm font-bold text-navy-900 group-hover:text-primary-600 line-clamp-2 transition-colors mb-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        <div>
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-black text-navy-900">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
            )}
          </div>

          {/* Action Button */}
          {inStock ? (
            <button
              onClick={() => addToCart(product._id, 1)}
              disabled={loading}
              className="w-full py-2.5 px-3 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-500 hover:text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            >
              <ShoppingCart size={15} />
              Add to Cart
            </button>
          ) : (
            <div className="w-full py-2.5 px-3 rounded-xl bg-gray-100 text-gray-400 font-bold text-xs text-center cursor-not-allowed">
              Out of Stock
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
