import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, ShieldCheck, Home } from 'lucide-react';
import { orderService } from '../../services/orderService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getMyOrder(id)
      .then(res => setOrder(res.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Retrieving order confirmation..." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-xl shadow-green-100">
        <CheckCircle size={44} />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-navy-900">Order Confirmed!</h1>
        <p className="text-sm text-gray-500">
          Thank you for choosing CareWell Pharmacy. Your order has been registered and is being prepared.
        </p>
      </div>

      {order && (
        <div className="card p-6 text-left space-y-4 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-400">Order Reference</p>
              <p className="font-mono font-bold text-navy-900 text-sm">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Total Paid</p>
              <p className="font-extrabold text-primary-600 text-sm">₹{order.totalAmount}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 mb-2">Delivery Address</p>
            <p className="text-xs text-navy-800">
              {order.shippingAddress?.name} • {order.shippingAddress?.phone}
            </p>
            <p className="text-xs text-gray-500">
              {order.shippingAddress?.line1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
          </div>

          {order.requiresPrescription && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
              <strong>Prescription Attached:</strong> Our pharmacist will review the prescription before dispatch.
            </div>
          )}
        </div>
      )}

      <div className="flex justify-center gap-4 pt-4">
        {order ? (
          <Link to={`/account/orders/${order._id}`} className="btn-primary text-xs">
            <Package size={16} /> View Order Details
          </Link>
        ) : (
          <Link to="/account/orders" className="btn-primary text-xs">
            <Package size={16} /> My Orders
          </Link>
        )}
        <Link to="/" className="btn-outline text-xs">
          <Home size={16} /> Return Home
        </Link>
      </div>
    </div>
  );
}
