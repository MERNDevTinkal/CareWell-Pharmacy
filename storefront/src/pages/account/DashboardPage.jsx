import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Heart, FileText, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';
import { wishlistService } from '../../services/wishlistService';

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getMyOrders({ limit: 3 })
      .then(res => setRecentOrders(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="card p-6 bg-gradient-to-r from-primary-600 to-teal-600 text-white shadow-xl">
        <h1 className="text-2xl font-black">Hello, {user?.name}!</h1>
        <p className="text-xs text-primary-100 mt-1">
          Welcome to your personal health dashboard. Manage your active orders, prescriptions, and saved addresses.
        </p>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/account/orders" className="card p-5 hover:border-primary-200 transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Orders</p>
            <p className="text-base font-bold text-navy-900">Manage Orders</p>
          </div>
        </Link>

        <Link to="/account/prescriptions" className="card p-5 hover:border-primary-200 transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Prescriptions</p>
            <p className="text-base font-bold text-navy-900">Pharmacist Status</p>
          </div>
        </Link>

        <Link to="/account/wishlist" className="card p-5 hover:border-primary-200 transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Heart size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Wishlist</p>
            <p className="text-base font-bold text-navy-900">Saved Items</p>
          </div>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="card p-6 space-y-4 bg-white">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="text-base font-extrabold text-navy-900">Recent Orders</h2>
          <Link to="/account/orders" className="text-xs font-bold text-primary-600 hover:underline">
            View All Orders
          </Link>
        </div>

        {loading ? (
          <p className="text-xs text-gray-400 py-4 text-center">Loading recent orders...</p>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-400 space-y-2">
            <Package size={32} className="mx-auto text-gray-300" />
            <p className="text-xs">You haven't placed any orders yet.</p>
            <Link to="/products" className="btn-primary text-xs inline-flex mt-2">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-navy-900">{order.orderNumber}</span>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="badge bg-primary-100 text-primary-800 text-[10px] font-bold capitalize">
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <span className="font-black text-xs text-navy-900">₹{order.totalAmount}</span>
                  <Link
                    to={`/account/orders/${order._id}`}
                    className="p-1.5 text-gray-400 hover:text-navy-900 rounded-lg hover:bg-gray-100"
                  >
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
