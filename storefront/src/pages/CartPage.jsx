import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useStore } from '../contexts/StoreContext';
import Breadcrumb from '../components/ui/Breadcrumb';
import EmptyState from '../components/ui/EmptyState';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, updateItem, removeItem, applyCoupon, removeCoupon, clearCart } = useCart();
  const { settings } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);

  const freeThreshold = Number(settings?.freeShippingThreshold || 599);
  const subtotal = cart?.subtotal || 0;
  const difference = Math.max(0, freeThreshold - subtotal);
  const shippingCharge = difference === 0 ? 0 : Number(settings?.shippingCharge || 49);
  const total = Math.max(0, subtotal - (cart?.couponDiscount || 0) + shippingCharge);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput('');
    } catch (e) {
      /* handled in context */
    } finally {
      setApplying(false);
    }
  };

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="Looks like you haven't added any pharmacy items or health supplements to your cart yet."
          actionText="Explore Pharmacy Catalog"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: 'Cart' }]} />

      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h1 className="text-2xl sm:text-3xl font-black text-navy-900">
          Shopping Cart ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})
        </h1>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Alert Banner */}
          <div className="p-4 rounded-2xl bg-primary-50 border border-primary-200 text-xs flex items-center justify-between">
            {difference > 0 ? (
              <span>Add <strong className="text-primary-700">₹{difference}</strong> more to qualify for <strong>FREE Home Delivery</strong>!</span>
            ) : (
              <span className="font-bold text-green-700">🎉 You have unlocked Free Delivery for this order!</span>
            )}
            <Link to="/products" className="font-bold text-primary-700 hover:underline whitespace-nowrap ml-4">
              + Add More
            </Link>
          </div>

          {cart.items.map((item) => (
            <div
              key={item._id}
              className="card p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={item.image || item.product?.images?.[0]?.url || 'https://placehold.co/100x100?text=Medicine'}
                  alt={item.name}
                  className="w-20 h-20 object-contain rounded-2xl bg-gray-50 p-2 flex-shrink-0 border border-gray-100"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-navy-900 leading-snug line-clamp-2">
                    {item.name || item.product?.name}
                  </h3>
                  {(item.prescriptionRequired || item.product?.prescriptionRequired) && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full mt-1">
                      <ShieldAlert size={10} /> Rx Prescription Required
                    </span>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Unit Price: ₹{item.price}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                {/* Quantity Controls */}
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                  <button
                    onClick={() => updateItem(item._id, Math.max(1, item.quantity - 1))}
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-navy-900 rounded-lg hover:bg-white"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold text-xs text-navy-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateItem(item._id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-navy-900 rounded-lg hover:bg-white"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Subtotal */}
                <span className="text-base font-black text-navy-900 min-w-[70px] text-right">
                  ₹{item.price * item.quantity}
                </span>

                {/* Delete */}
                <button
                  onClick={() => removeItem(item._id)}
                  className="p-2 text-gray-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card p-6 space-y-5 bg-white">
            <h2 className="text-base font-extrabold text-navy-900 pb-3 border-b border-gray-100">
              Order Summary
            </h2>

            {/* Coupon Application */}
            {cart.couponCode ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-800">
                <span className="font-bold flex items-center gap-1.5">
                  <Tag size={14} /> Coupon {cart.couponCode} applied (-₹{cart.couponDiscount})
                </span>
                <button
                  onClick={removeCoupon}
                  className="text-red-500 hover:underline font-bold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code (e.g. WELCOME10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="input text-xs uppercase font-mono"
                />
                <button
                  type="submit"
                  disabled={applying}
                  className="btn-secondary text-xs px-4 py-2 disabled:opacity-50"
                >
                  Apply
                </button>
              </form>
            )}

            {/* Calculations */}
            <div className="space-y-2.5 text-xs text-gray-600 pt-2">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-navy-900">₹{subtotal}</span>
              </div>
              {cart.couponDiscount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{cart.couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping & Handling</span>
                <span>{shippingCharge === 0 ? <strong className="text-green-600">FREE</strong> : `₹${shippingCharge}`}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-black text-navy-900">
                <span>Estimated Total</span>
                <span className="text-primary-600 text-xl">₹{total}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full justify-center py-3.5 text-sm shadow-lg shadow-primary-500/25"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
              <ShieldCheck size={16} className="text-primary-600" />
              <span>Safe & Secure 256-Bit SSL Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

