import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Filter, ShieldAlert, ShoppingBag } from 'lucide-react';
import { orderService } from '../services/orderService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import StatusBadge from '../components/ui/StatusBadge';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    orderService.getOrders({
      page,
      limit: 10,
      search: search || undefined,
      status: statusFilter || undefined,
      paymentStatus: paymentStatusFilter || undefined,
      sort: '-createdAt'
    })
      .then((res) => {
        setOrders(res.data?.data || []);
        if (res.data?.pagination) {
          setPages(res.data.pagination.pages);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, paymentStatusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const columns = [
    {
      header: 'Order #',
      render: (o) => (
        <div>
          <Link
            to={`/admin/orders/${o._id}`}
            className="font-bold text-navy-900 hover:text-primary-600 transition-colors font-mono text-xs"
          >
            {o.orderNumber}
          </Link>
          <p className="text-[11px] text-gray-400">
            {new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )
    },
    {
      header: 'Customer',
      render: (o) => (
        <div>
          <p className="font-semibold text-navy-900 text-xs">
            {o.customerInfo?.name || o.shippingAddress?.name || 'Customer'}
          </p>
          <p className="text-[11px] text-gray-400">
            {o.customerInfo?.email || o.shippingAddress?.phone || '—'}
          </p>
        </div>
      )
    },
    {
      header: 'Items',
      render: (o) => (
        <span className="text-xs text-navy-800 font-medium">
          {o.items?.reduce((acc, item) => acc + item.quantity, 0) || 0} items
        </span>
      )
    },
    {
      header: 'Total',
      render: (o) => (
        <div className="font-bold text-navy-900 text-xs">
          ₹{o.totalAmount}
        </div>
      )
    },
    {
      header: 'Payment',
      render: (o) => (
        <div>
          <span className="text-[11px] font-semibold uppercase text-gray-500 block">
            {o.paymentMethod?.replace('demo_', '')}
          </span>
          <span className={`badge ${
            o.paymentStatus === 'paid'
              ? 'bg-green-100 text-green-800'
              : o.paymentStatus === 'failed'
              ? 'bg-rose-100 text-rose-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {o.paymentStatus}
          </span>
        </div>
      )
    },
    {
      header: 'Rx',
      render: (o) => (
        o.requiresPrescription ? (
          <span className="badge bg-amber-100 text-amber-800 flex items-center gap-1 w-max">
            <ShieldAlert size={10} /> Rx Required
          </span>
        ) : (
          <span className="badge bg-gray-100 text-gray-400">No</span>
        )
      )
    },
    {
      header: 'Status',
      render: (o) => <StatusBadge status={o.status} />
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (o) => (
        <Link
          to={`/admin/orders/${o._id}`}
          className="p-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
        >
          <Eye size={13} /> View
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders Management"
        subtitle="Manage customer orders, dispatch status, tracking, and prescription approvals"
      />

      {/* Filter and Search Bar */}
      <div className="card p-4 bg-white flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by order #, customer, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input w-full sm:w-44 text-xs"
          >
            <option value="">All Statuses</option>
            <option value="pending_confirmation">Pending Confirmation</option>
            <option value="prescription_review_pending">Prescription Review</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input w-full sm:w-40 text-xs"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyMessage="No orders found matching the filter criteria."
      />

      <Pagination
        page={page}
        pages={pages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}
