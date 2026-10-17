import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  ArrowLeft,
  Truck,
  RotateCcw,
  CheckCircle,
  Clock,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchOrder = () => {
    setLoading(true);
    orderService.getMyOrder(id)
      .then(res => setOrder(res.data?.data))
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancel = async (e) => {
    e.preventDefault();
    setCancelling(true);
    try {
      await orderService.cancelOrder(order._id, cancelReason || 'Customer requested cancellation');
      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
      fetchOrder();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-12 text-center">
        <LoadingSpinner size="lg" text="Loading order details..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="card p-12 text-center space-y-4">
        <p className="text-sm text-gray-500">Order not found.</p>
        <Link to="/account/orders" className="btn-primary text-xs">Back to Orders</Link>
      </div>
    );
  }

  const cancellable = ['pending_confirmation', 'prescription_review_pending', 'confirmed'].includes(order.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/account/orders" className="text-xs font-bold text-gray-500 hover:text-navy-900 inline-flex items-center gap-1.5">
          <ArrowLeft size={14} /> Back to All Orders
        </Link>
        {cancellable && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="text-xs font-bold text-rose-600 hover:underline"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* Main Order Card */}
      <div className="card p-6 space-y-6 bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <span className="text-xs text-gray-400">Order Number</span>
            <h1 className="text-xl font-mono font-black text-navy-900">{order.orderNumber}</h1>
            <p className="text-xs text-gray-400 mt-0.5">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <span className="badge bg-primary-100 text-primary-800 text-xs font-bold capitalize">
              {order.status.replace(/_/g, ' ')}
            </span>
            <p className="text-xs text-gray-500 mt-1 capitalize">Payment: {order.paymentMethod.replace(/_/g, ' ')} ({order.paymentStatus})</p>
          </div>
        </div>

        {/* Tracking info if present */}
        {order.trackingNumber && (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-blue-600" />
              <span>Courier: <strong>{order.courier || 'Express Logistics'}</strong> (Tracking: <strong>{order.trackingNumber}</strong>)</span>
            </div>
            {order.trackingUrl && (
              <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="font-bold underline text-blue-700">
                Live Track
              </a>
            )}
          </div>
        )}

        {/* Prescription Attached */}
        {order.requiresPrescription && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <ShieldAlert size={18} className="text-amber-600 flex-shrink-0" />
            <span>Prescription order. Verified by registered pharmacists prior to dispatch.</span>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-navy-900">Ordered Products</h2>
          <div className="divide-y divide-gray-100">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image || 'https://placehold.co/100x100?text=Medicine'}
                    alt=""
                    className="w-12 h-12 object-contain rounded-xl bg-gray-50 p-1 border border-gray-100 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-navy-900 truncate">{item.productName}</p>
                    <p className="text-gray-400">Unit Price: ₹{item.price} • Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-black text-navy-900 text-sm">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600 max-w-xs ml-auto">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-navy-900">₹{order.subtotal}</span>
          </div>
          {order.couponDiscount > 0 && (
            <div className="flex justify-between text-green-600 font-semibold">
              <span>Coupon Discount ({order.couponCode})</span>
              <span>-₹{order.couponDiscount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{order.shippingCharge === 0 ? <strong className="text-green-600">FREE</strong> : `₹${order.shippingCharge}`}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-black text-navy-900">
            <span>Total Paid</span>
            <span className="text-primary-600 text-base">₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Status History Timeline */}
        {order.statusHistory?.length > 0 && (
          <div className="border-t border-gray-100 pt-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Status History</h3>
            <div className="space-y-3">
              {order.statusHistory.map((sh, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-navy-900 capitalize">{sh.status.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-gray-400 ml-2">{new Date(sh.timestamp).toLocaleString()}</span>
                    {sh.note && <p className="text-gray-500 mt-0.5">{sh.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-navy-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 max-w-md w-full bg-white space-y-4">
            <h3 className="text-base font-bold text-navy-900">Cancel Order {order.orderNumber}</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to cancel this order? Items will be returned to stock.
            </p>
            <div>
              <label className="label">Cancellation Reason</label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Ordered by mistake, found alternative"
                className="input text-xs"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="btn-outline text-xs px-4"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
