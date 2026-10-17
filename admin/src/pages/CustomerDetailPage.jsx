import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Package, FileCheck, ShieldCheck, UserX, Clock } from 'lucide-react';
import { customerService } from '../services/customerService';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import toast from 'react-hot-toast';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomer = () => {
    setLoading(true);
    customerService.getCustomer(id)
      .then((res) => setData(res.data?.data || null))
      .catch(() => toast.error('Failed to load customer details'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleToggleStatus = async () => {
    try {
      await customerService.toggleStatus(id);
      toast.success('Status updated');
      fetchCustomer();
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!data?.customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Customer not found.</p>
        <Link to="/admin/customers" className="btn-primary mt-4 inline-flex">
          Back to Customers
        </Link>
      </div>
    );
  }

  const { customer, orders = [], prescriptions = [] } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/customers"
            className="p-2 text-gray-400 hover:text-navy-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <PageHeader
            title={customer.name}
            subtitle={`Customer account created on ${new Date(customer.createdAt).toLocaleDateString()}`}
          />
        </div>

        <button
          onClick={handleToggleStatus}
          className={`btn-ghost text-xs border ${
            customer.isActive ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-green-200 text-green-600 hover:bg-green-50'
          }`}
        >
          {customer.isActive ? <UserX size={14} /> : <ShieldCheck size={14} />}
          {customer.isActive ? 'Suspend Customer Account' : 'Reactivate Account'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Addresses */}
        <div className="space-y-6">
          <div className="card bg-white p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold text-lg flex items-center justify-center">
                {customer.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-navy-900 text-sm">{customer.name}</p>
                <p className="text-xs text-gray-400">{customer.email}</p>
                <p className="text-xs text-gray-400">{customer.phone || 'No phone set'}</p>
              </div>
            </div>

            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Account Status:</span>
                <span className={`badge ${customer.isActive ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'}`}>
                  {customer.isActive ? 'Active' : 'Suspended'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Lifetime Orders:</span>
                <span className="font-bold text-navy-900">{orders.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Prescriptions Submitted:</span>
                <span className="font-bold text-navy-900">{prescriptions.length}</span>
              </div>
            </div>
          </div>

          {/* Saved Addresses */}
          <div className="card bg-white p-6 space-y-3">
            <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-2">
              <MapPin size={16} className="text-primary-500" /> Saved Delivery Addresses ({customer.addresses?.length || 0})
            </h3>

            {customer.addresses?.length > 0 ? (
              <div className="space-y-3">
                {customer.addresses.map((a, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-navy-900">{a.name}</span>
                      <span className="badge bg-gray-200 text-gray-600 uppercase text-[10px]">{a.type || 'home'}</span>
                    </div>
                    <p className="text-gray-500">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                    <p className="text-gray-500">{a.city}, {a.state} - {a.pincode}</p>
                    <p className="text-gray-400">Phone: {a.phone}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No saved addresses on profile.</p>
            )}
          </div>
        </div>

        {/* Right Column: Order History & Prescriptions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <div className="card bg-white p-6 space-y-4">
            <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-3">
              <Package size={16} className="text-primary-500" /> Order History ({orders.length})
            </h3>

            {orders.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <div key={o._id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <Link
                        to={`/admin/orders/${o._id}`}
                        className="font-bold text-primary-600 hover:underline font-mono text-xs"
                      >
                        {o.orderNumber}
                      </Link>
                      <p className="text-[11px] text-gray-400">
                        {new Date(o.createdAt).toLocaleDateString()} &bull; {o.items?.length || 0} items
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-navy-900 text-xs font-mono">₹{o.totalAmount}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic py-4">No orders placed by this customer yet.</p>
            )}
          </div>

          {/* Prescriptions */}
          <div className="card bg-white p-6 space-y-4">
            <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-3">
              <FileCheck size={16} className="text-primary-500" /> Uploaded Prescriptions ({prescriptions.length})
            </h3>

            {prescriptions.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {prescriptions.map((p) => (
                  <div key={p._id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-navy-900">
                        Prescription ({p.files?.length || 0} file{p.files?.length === 1 ? '' : 's'})
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Uploaded on {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span className={`badge ${
                      p.status === 'approved' ? 'bg-green-100 text-green-800' : p.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.status?.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic py-4">No prescriptions submitted yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
