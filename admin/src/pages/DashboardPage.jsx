import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Users,
  Package,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { dashboardService } from '../services/dashboardService';
import StatsCard from '../components/ui/StatsCard';
import StatusBadge from '../components/ui/StatusBadge';
import PageHeader from '../components/ui/PageHeader';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [salesChart, setSalesChart] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.getStats(),
      dashboardService.getSalesChart(7),
      dashboardService.getBestSellers(),
      dashboardService.getRecentOrders()
    ])
      .then(([statsRes, chartRes, bestRes, ordersRes]) => {
        setStats(statsRes.data?.data);
        setSalesChart(chartRes.data?.data || []);
        setBestSellers(bestRes.data?.data || []);
        setRecentOrders(ordersRes.data?.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pharmacy Operations Dashboard"
        subtitle="Real-time sales, order fulfillment, prescription review queues, and catalog health"
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={`₹${stats?.totalSales || 0}`}
          icon={DollarSign}
          color="primary"
          subtitle="All confirmed paid orders"
        />
        <StatsCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingBag}
          color="blue"
          subtitle={`${stats?.todayOrders || 0} placed today`}
        />
        <StatsCard
          title="Prescriptions Pending"
          value={stats?.pendingPrescriptions || 0}
          icon={FileCheck}
          color="amber"
          subtitle="Awaiting pharmacist approval"
        />
        <StatsCard
          title="Low Stock Alerts"
          value={stats?.lowStockProducts || 0}
          icon={AlertTriangle}
          color="rose"
          subtitle="Products below threshold"
        />
      </div>

      {/* Sales Overview Chart */}
      <div className="card p-6 bg-white space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-primary-600" />
              Sales & Revenue Trend (Last 7 Days)
            </h2>
            <p className="text-[11px] text-gray-400">Aggregated paid pharmacy orders</p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          {salesChart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              No sales data in this date range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="_id" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  name="Revenue (₹)"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Grid: Recent Orders & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 card p-6 bg-white space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-navy-900">Recent Customer Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-primary-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-400 uppercase text-[10px] font-bold border-b border-gray-100 pb-2">
                  <th className="py-2">Order #</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-mono font-bold text-navy-900">{order.orderNumber}</td>
                    <td className="py-3">{order.customerInfo?.name || 'Customer'}</td>
                    <td className="py-3"><StatusBadge status={order.status} /></td>
                    <td className="py-3 font-bold text-navy-900">₹{order.totalAmount}</td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="text-primary-600 hover:underline font-bold text-xs"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Selling Medicines */}
        <div className="lg:col-span-4 card p-6 bg-white space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-navy-900">Top Selling Medicines</h3>
            <Link to="/admin/products" className="text-xs font-bold text-primary-600 hover:underline">
              Catalog
            </Link>
          </div>

          <div className="space-y-3">
            {bestSellers.map((prod) => (
              <div key={prod._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <img
                  src={prod.images?.[0]?.url || 'https://placehold.co/100x100?text=Medicine'}
                  alt=""
                  className="w-10 h-10 object-contain rounded-lg bg-gray-50 p-1 border border-gray-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-navy-900 text-xs truncate">{prod.name}</p>
                  <p className="text-[11px] text-gray-400">₹{prod.price} • {prod.salesCount || 0} units sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
