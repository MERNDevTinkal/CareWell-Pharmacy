import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { orderService } from '../../services/orderService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchOrders = (page = 1) => {
    setLoading(true);
    orderService.getMyOrders({ page, limit: 10 })
      .then(res => {
        setOrders(res.data?.data || []);
        if (res.data?.pagination) setPagination(res.data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders(1);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return <span className="badge bg-green-100 text-green-800">Delivered</span>;
      case 'shipped':
        return <span className="badge bg-blue-100 text-blue-800">Shipped</span>;
      case 'cancelled':
        return <span className="badge bg-red-100 text-red-800">Cancelled</span>;
      case 'prescription_review_pending':
        return <span className="badge bg-amber-100 text-amber-800">Prescription Review</span>;
      default:
        return <span className="badge bg-primary-100 text-primary-800 capitalize">{status.replace(/_/g, ' ')}</span>;
    }
  };

  return (
    <div className="card p-6 space-y-6 bg-white">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-navy-900">My Orders</h1>
          <p className="text-xs text-gray-500">Track and review your previous healthcare purchases</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="md" text="Loading your orders..." />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Orders Found"
          description="You haven't placed any pharmacy orders yet."
          actionText="Browse Medicines"
          actionLink="/products"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="p-5 rounded-2xl border border-gray-200 hover:border-primary-200 transition-all space-y-4 bg-white"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 text-xs">
                <div>
                  <span className="font-mono font-bold text-navy-900 text-sm">{order.orderNumber}</span>
                  <span className="text-gray-400 ml-3">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <span className="font-black text-navy-900 text-sm">₹{order.totalAmount}</span>
                </div>
              </div>

              {/* Items summary */}
              <div className="space-y-2">
                {order.items?.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-navy-800">
                    <span className="truncate max-w-md font-medium">
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="text-gray-500 font-mono">₹{item.price * item.quantity}</span>
                  </div>
                ))}
                {order.items?.length > 3 && (
                  <p className="text-[11px] text-gray-400 italic">
                    +{order.items.length - 3} more {order.items.length - 3 === 1 ? 'item' : 'items'}
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  to={`/account/orders/${order._id}`}
                  className="btn-outline text-xs px-4 py-2"
                >
                  View Details & Tracking <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}

          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={fetchOrders}
          />
        </div>
      )}
    </div>
  );
}
