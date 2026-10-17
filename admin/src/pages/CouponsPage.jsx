import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Ticket, Percent, DollarSign, Calendar } from 'lucide-react';
import { couponService } from '../services/couponService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage',
    value: 10,
    minPurchase: 0,
    maxDiscount: 100,
    endDate: '',
    isActive: true
  });

  const fetchCoupons = () => {
    setLoading(true);
    couponService.getCoupons()
      .then((res) => setCoupons(res.data?.data || []))
      .catch(() => toast.error('Failed to load coupons'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      type: 'percentage',
      value: 10,
      minPurchase: 299,
      maxDiscount: 100,
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true
    });
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code || '',
      description: c.description || '',
      type: c.type || 'percentage',
      value: c.value ?? 10,
      minPurchase: c.minPurchase ?? 0,
      maxDiscount: c.maxDiscount ?? 100,
      endDate: c.endDate ? new Date(c.endDate).toISOString().split('T')[0] : '',
      isActive: c.isActive ?? true
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || formData.value === undefined) {
      toast.error('Coupon code and discount value are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        value: parseFloat(formData.value),
        minPurchase: parseFloat(formData.minPurchase) || 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined
      };

      if (editingCoupon) {
        await couponService.updateCoupon(editingCoupon._id, payload);
        toast.success('Coupon updated successfully');
      } else {
        await couponService.createCoupon(payload);
        toast.success('Coupon created successfully');
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await couponService.deleteCoupon(deleteId);
      toast.success('Coupon deleted');
      setDeleteId(null);
      fetchCoupons();
    } catch (err) {
      toast.error(err.message || 'Failed to delete coupon');
    }
  };

  const columns = [
    {
      header: 'Coupon Code',
      render: (c) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-xs px-2.5 py-1 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg">
            {c.code}
          </span>
          {c.description && <span className="text-gray-400 text-xs hidden sm:inline">{c.description}</span>}
        </div>
      )
    },
    {
      header: 'Discount',
      render: (c) => (
        <span className="font-bold text-navy-900 text-xs">
          {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} FLAT OFF`}
        </span>
      )
    },
    {
      header: 'Min Purchase',
      render: (c) => <span className="text-xs text-gray-600">₹{c.minPurchase || 0}</span>
    },
    {
      header: 'Times Used',
      render: (c) => (
        <span className="badge bg-gray-100 text-gray-700 font-bold">
          {c.usedCount ?? 0} times
        </span>
      )
    },
    {
      header: 'Expires On',
      render: (c) => (
        <span className="text-xs text-gray-500">
          {c.endDate ? new Date(c.endDate).toLocaleDateString() : 'Never'}
        </span>
      )
    },
    {
      header: 'Status',
      render: (c) => (
        <span className={`badge ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
          {c.isActive ? 'Active' : 'Disabled'}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openEditModal(c)}
            className="p-1.5 text-gray-400 hover:text-navy-900 rounded-lg hover:bg-gray-100"
            title="Edit Coupon"
          >
            <Edit size={15} />
          </button>
          <button
            onClick={() => setDeleteId(c._id)}
            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
            title="Delete Coupon"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discount Coupons & Offers"
        subtitle="Create promotional promo codes, cart value thresholds, and category discounts"
        actions={
          <button onClick={openCreateModal} className="btn-primary text-xs">
            <Plus size={15} /> Add Coupon
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={coupons}
        loading={loading}
        emptyMessage="No coupons found. Click 'Add Coupon' to create your first promotion."
      />

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-navy-900 text-base">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-navy-900 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Promo Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. WELCOME10"
                    required
                    className="input uppercase font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="label">Discount Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Discount Value *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Min Cart Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Max Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="None"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">Description / Offer Tagline</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. 10% off your first health order"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Expiration Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-xs font-semibold text-navy-800">Coupon Active</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? Customers will no longer be able to apply it at checkout."
        danger={true}
      />
    </div>
  );
}
