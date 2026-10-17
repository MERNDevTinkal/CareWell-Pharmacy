import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  ShieldCheck,
  ShieldAlert,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import Breadcrumb from '../components/ui/Breadcrumb';
import PriceDisplay from '../components/ui/PriceDisplay';
import RatingStars from '../components/ui/RatingStars';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart, loading: cartLoading } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);

  // Review submission state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    productService.getProduct(slug)
      .then((res) => {
        const prod = res.data?.data;
        setProduct(prod);
        if (prod?._id) {
          productService.getRelated(prod._id)
            .then(rRes => setRelatedProducts(rRes.data?.data || []))
            .catch(() => {});

          reviewService.getProductReviews(prod._id)
            .then(revRes => setReviews(revRes.data?.data || []))
            .catch(() => {});
        }
      })
      .catch((err) => {
        toast.error('Failed to load product details');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading product details..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-navy-900 mb-2">Product Not Found</h2>
        <p className="text-xs text-gray-500 mb-6">The requested product could not be found or has been discontinued.</p>
        <Link to="/products" className="btn-primary text-xs">Back to Products</Link>
      </div>
    );
  }

  const isFav = isInWishlist(product._id);
  const inStock = product.stock > 0;
  const images = product.images && product.images.length > 0
    ? product.images.map(img => img.url)
    : ['https://placehold.co/600x600?text=Medicine'];

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to write a review');
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        productId: product._id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment
      });
      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      setReviewTitle('');
      setReviewComment('');
      // Refresh reviews
      const revRes = await reviewService.getProductReviews(product._id);
      setReviews(revRes.data?.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Products', url: '/products' },
          { label: product.category?.name || 'Category', url: `/products?category=${product.category?.slug}` },
          { label: product.name }
        ]}
      />

      {/* Product Top Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Left Column: Image Gallery */}
        <div className="md:col-span-6 space-y-4">
          <div className="card p-6 bg-gray-50/50 aspect-square flex items-center justify-center relative overflow-hidden">
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 badge bg-green-500 text-white font-bold text-xs shadow-md">
                {product.discount}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product._id)}
              className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all ${
                isFav
                  ? 'bg-rose-50 text-rose-500'
                  : 'bg-white/80 text-gray-400 hover:text-rose-500 hover:bg-white shadow-sm'
              }`}
            >
              <Heart size={20} fill={isFav ? 'currentColor' : 'none'} />
            </button>
            <img
              src={images[activeImage]}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-gray-50 p-1 flex-shrink-0 transition-all ${
                    activeImage === idx ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-200'
                  }`}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Purchase Controls */}
        <div className="md:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-primary-600 uppercase tracking-wide">
                {product.brand?.name || 'CareWell'}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">SKU: {product.sku}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-navy-900 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <RatingStars
                rating={product.reviewSummary?.average || 0}
                count={product.reviewSummary?.count || 0}
              />
            </div>
          </div>

          {/* Prescription Alert Banner */}
          {product.prescriptionRequired && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
              <ShieldAlert size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">Prescription Required (Schedule Rx)</p>
                <p className="text-amber-800 mt-0.5">
                  A valid doctor's prescription is required to fulfill this medication. You will be prompted to attach it at checkout.
                </p>
              </div>
            </div>
          )}

          {/* Price Box */}
          <div className="card p-5 bg-gradient-to-br from-primary-50/50 to-emerald-50/20 border border-primary-100">
            <PriceDisplay
              price={product.price}
              mrp={product.mrp}
              discount={product.discount}
              size="lg"
            />
            <p className="text-[11px] text-gray-500 mt-1">Inclusive of all applicable GST taxes</p>
          </div>

          {/* Stock & Quantity Selection */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy-900">Availability:</span>
              {inStock ? (
                <span className="badge bg-green-100 text-green-800 font-bold flex items-center gap-1">
                  <CheckCircle size={12} /> In Stock ({product.stock} units)
                </span>
              ) : (
                <span className="badge bg-red-100 text-red-800 font-bold flex items-center gap-1">
                  <AlertCircle size={12} /> Out of Stock
                </span>
              )}
            </div>

            {inStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-navy-900">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-xl bg-white p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-navy-900 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-navy-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-navy-900 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => addToCart(product._id, quantity)}
              disabled={!inStock || cartLoading}
              className="btn-primary flex-1 justify-center py-3.5 text-sm shadow-lg shadow-primary-500/25 disabled:opacity-50"
            >
              <ShoppingCart size={18} />
              {inStock ? 'Add to Cart' : 'Currently Unavailable'}
            </button>
            <button
              onClick={() => toggleWishlist(product._id)}
              className="btn-outline px-5 py-3.5 text-sm justify-center"
            >
              <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
              {isFav ? 'Wishlisted' : 'Save'}
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary-600 flex-shrink-0" />
              <span>100% Genuine Medicine</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-primary-600 flex-shrink-0" />
              <span>Fast Doorstep Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={16} className="text-primary-600 flex-shrink-0" />
              <span>7-Day Hassle-Free Returns</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-primary-600 flex-shrink-0" />
              <span>Pharmacist Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="card">
        <div className="flex border-b border-gray-100 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-6 py-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'description' ? 'border-primary-500 text-primary-600 bg-primary-50/20' : 'border-transparent text-gray-500 hover:text-navy-900'
            }`}
          >
            Description & Usage
          </button>
          {product.ingredients && (
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`px-6 py-4 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'ingredients' ? 'border-primary-500 text-primary-600 bg-primary-50/20' : 'border-transparent text-gray-500 hover:text-navy-900'
              }`}
            >
              Ingredients & Composition
            </button>
          )}
          {product.storage && (
            <button
              onClick={() => setActiveTab('storage')}
              className={`px-6 py-4 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'storage' ? 'border-primary-500 text-primary-600 bg-primary-50/20' : 'border-transparent text-gray-500 hover:text-navy-900'
              }`}
            >
              Storage & Safety
            </button>
          )}
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'reviews' ? 'border-primary-500 text-primary-600 bg-primary-50/20' : 'border-transparent text-gray-500 hover:text-navy-900'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>

        <div className="p-6 text-sm text-navy-800 leading-relaxed">
          {activeTab === 'description' && (
            <div className="space-y-4">
              <p>{product.description || product.shortDescription || 'No description available for this product.'}</p>
              {product.manufacturer && (
                <p className="text-xs text-gray-500">
                  <strong>Manufacturer:</strong> {product.manufacturer} ({product.countryOfOrigin || 'India'})
                </p>
              )}
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="space-y-3">
              <h4 className="font-bold text-navy-900">Active Composition:</h4>
              <p>{product.composition || product.ingredients || 'Standard pharmaceutical grade active ingredients.'}</p>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-3">
              <h4 className="font-bold text-navy-900">Storage Directions:</h4>
              <p>{product.storage || 'Store in a cool, dry place away from direct sunlight.'}</p>
              {product.warnings && (
                <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs font-semibold mt-3">
                  ⚠️ Warnings: {product.warnings}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <RatingStars
                  rating={product.reviewSummary?.average || 0}
                  count={product.reviewSummary?.count || 0}
                  size={20}
                />
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="btn-outline text-xs px-4 py-2"
                >
                  Write a Review
                </button>
              </div>

              {/* Review Submission Form */}
              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} className="card p-5 bg-gray-50 space-y-4 border border-gray-200">
                  <h4 className="text-sm font-bold text-navy-900">Write Your Customer Review</h4>
                  <div>
                    <label className="label">Rating (1 to 5 Stars)</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="input w-36"
                    >
                      <option value={5}>5 Stars - Excellent</option>
                      <option value={4}>4 Stars - Good</option>
                      <option value={3}>3 Stars - Average</option>
                      <option value={2}>2 Stars - Poor</option>
                      <option value={1}>1 Star - Terrible</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Review Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Fast relief, authentic packaging"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      required
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Detailed Feedback</label>
                    <textarea
                      rows={3}
                      placeholder="Share your experience with this medication or health product..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      className="input"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={submittingReview} className="btn-primary text-xs">
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                    <button type="button" onClick={() => setShowReviewForm(false)} className="btn-ghost text-xs">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <p className="text-xs text-gray-500 py-4">No reviews yet. Be the first to review this product!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-4 rounded-2xl border border-gray-100 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy-900 text-xs">{rev.user?.name || 'Customer'}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <RatingStars rating={rev.rating} showCount={false} size={14} />
                      <p className="font-bold text-xs text-navy-900">{rev.title}</p>
                      <p className="text-xs text-gray-600">{rev.comment}</p>
                      {rev.isVerifiedPurchase && (
                        <span className="inline-block text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-navy-900">Related Healthcare Essentials</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

