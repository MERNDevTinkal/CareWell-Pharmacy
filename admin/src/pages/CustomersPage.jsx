import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Eye, ShieldCheck, UserX, CheckCircle, XCircle } from 'lucide-react';
import { customerService } from '../services/customerService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchCustomers = () => {
    setLoading(true);
    customerService.getCustomers({
      page,
      limit: 10,
      search: search || undefined
    })
      .then((res) => {
        setCustomers(res.data?.data || []);
        if (res.data?.pagination) {
          setPages(res.data.pagination.pages);
        }
      })
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await customerService.toggleStatus(id);
      toast.success(res.data?.message || 'Updated customer status');
      fetchCustomers();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const columns = [
    {
      header: 'Customer',
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
            {c.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-bold text-navy-900 text-xs">{c.name}</p>
            <p className="text-[11px] text-gray-400">{c.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Phone',
      render: (c) => <span className="text-xs text-gray-600 font-mono">{c.phone || '—'}</span>
    },
    {
      header: 'Total Orders',
      render: (c) => (
        <span className="badge bg-gray-100 text-gray-800 font-bold">
          {c.orderCount ?? 0} orders
        </span>
      )
    },
    {
      header: 'Joined On',
      render: (c) => (
        <span className="text-xs text-gray-400">
          {new Date(c.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Account Status',
      render: (c) => (
        <span className={`badge ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'}`}>
          {c.isActive ? 'Active' : 'Suspended'}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/admin/customers/${c._id}`}
            className="p-1.5 text-xs text-primary-600 hover:text-primary-700 bg-primary-50 rounded-lg"
            title="View Profile & Orders"
          >
            <Eye size={13} />
          </Link>
          <button
            onClick={() => handleToggleStatus(c._id)}
            className={`p-1.5 text-xs rounded-lg transition-colors ${
              c.isActive
                ? 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
            }`}
            title={c.isActive ? 'Suspend Account' : 'Activate Account'}
          >
            {c.isActive ? <UserX size={13} /> : <ShieldCheck size={13} />}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Directory"
        subtitle="View registered customers, purchase history, delivery addresses, and account status"
      />

      <div className="card p-4 bg-white flex flex-col sm:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by customer name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </form>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        emptyMessage="No customers found."
      />

      <Pagination
        page={page}
        pages={pages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}
