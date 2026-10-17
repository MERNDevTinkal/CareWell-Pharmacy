import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useStore } from '../../contexts/StoreContext';
import toast from 'react-hot-toast';

export default function CartDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const { cart, updateItem, removeItem, applyCoupon, removeCoupon } = useCart();
  const { settings } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  if (!open) return null;

  const freeThreshold = Number(settings?.freeShippingThreshold || 599);
  const subtotal = cart?.subtotal || 0;
  const difference = Math.max(0, freeThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      await applyCoupon(couponCode.trim());
      setCouponCode('');
    } catch (e) {
      /* toast handled in context */
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleProceedCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-primary-600" />
              <h2 className="text-lg font-bold text-navy-900">Your Shopping Cart</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                {cart?.items?.length || 0}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-6 py-3 bg-primary-50/50 border-b border-primary-100/50">
            {difference > 0 ? (
              <p className="text-xs font-medium text-navy-700">
                Add <span className="font-bold text-primary-600">₹{difference}</span> more to unlock <span className="font-bold">FREE Delivery</span>!
              </p>
            ) : (
              <p className="text-xs font-bold text-green-700 flex items-center gap-1">
                🎉 Congratulations! You unlocked FREE Delivery!
              </p>
            )}
            <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                style={{ width: `${progressPercent}%` }}
                className="bg-primary-500 h-full rounded-full transition-all duration-300"
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!cart?.items || cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="text-base font-bold text-navy-900 mb-1">Your cart is empty</h3>
                <p className="text-xs text-gray-500 mb-6 max-w-xs">
                  Browse our pharmacy catalog and add genuine healthcare products to your cart.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/products');
                  }}
                  className="btn-primary text-xs"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-4 p-3 rounded-2xl border border-gray-100 hover:border-gray-200 bg-white transition-all shadow-sm"
                >
                  <img
                    src={item.image || item.product?.images?.[0]?.url || 'https://placehold.co/100x100?text=Medicine'}
                    alt={item.name}
                    className="w-16 h-16 object-contain rounded-xl bg-gray-50 p-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-navy-900 line-clamp-2">
                      {item.name || item.product?.name}
                    </p>
                    {(item.prescriptionRequired || item.product?.prescriptionRequired) && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        Rx Required
                      </span>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-extrabold text-primary-600">
                        ₹{item.price * item.quantity}
                      </span>
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => updateItem(item._id, Math.max(1, item.quantity - 1))}
                          className="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-navy-900 rounded"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold text-navy-900 w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(item._id, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-navy-900 rounded"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="text-gray-300 hover:text-rose-500 self-start p-1 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Totals */}
          {cart?.items?.length > 0 && (
            <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
              {/* Coupon Box */}
              {cart.couponCode ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 rounded-xl text-xs text-green-800">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Tag size={14} /> Coupon {cart.couponCode} applied (-₹{cart.couponDiscount})
                  </div>
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
                    placeholder="Enter coupon (e.g. WELCOME10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase font-mono"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon}
                    className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-navy-900">₹{subtotal}</span>
                </div>
                {cart.couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-₹{cart.couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span>{difference === 0 ? <strong className="text-green-600">FREE</strong> : `₹${settings?.shippingCharge || 49}`}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold text-navy-900">
                  <span>Total Amount</span>
                  <span className="text-primary-600 text-base">
                    ₹{Math.max(0, subtotal - (cart.couponDiscount || 0) + (difference === 0 ? 0 : Number(settings?.shippingCharge || 49)))}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceedCheckout}
                className="btn-primary w-full justify-center text-sm shadow-lg shadow-primary-500/25"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
