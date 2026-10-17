import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, UserX, ShieldCheck, Key } from 'lucide-react';
import { adminUserService } from '../services/adminUserService';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const { admin: currentAdmin } = useAdminAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'order_manager'
  });

  const roles = [
    { value: 'super_admin', label: 'Super Administrator' },
    { value: 'catalog_manager', label: 'Catalog Manager' },
    { value: 'order_manager', label: 'Order & Fulfillment Manager' },
    { value: 'prescription_reviewer', label: 'Licensed Pharmacist' },
    { value: 'content_manager', label: 'Content Manager' }
  ];

  const fetchAdmins = () => {
    setLoading(true);
    adminUserService.getAdminUsers()
      .then((res) => setAdmins(res.data?.data || []))
      .catch(() => toast.error('Failed to load admin users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const openCreateModal = () => {
    setEditingAdmin(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'order_manager'
    });
    setModalOpen(true);
  };

  const openEditModal = (a) => {
    setEditingAdmin(a);
    setFormData({
      name: a.name || '',
      email: a.email || '',
      password: '',
      role: a.role || 'order_manager'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || (!editingAdmin && !formData.password)) {
      toast.error('Please fill required fields');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (editingAdmin && !payload.password) {
        delete payload.password;
      }

      if (editingAdmin) {
        await adminUserService.updateAdminUser(editingAdmin._id, payload);
        toast.success('Admin user updated');
      } else {
        await adminUserService.createAdminUser(payload);
        toast.success('Admin user created');
      }
      setModalOpen(false);
      fetchAdmins();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await adminUserService.toggleStatus(id);
      toast.success('Account status toggled');
      fetchAdmins();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminUserService.deleteAdminUser(deleteId);
      toast.success('Admin account deleted');
      setDeleteId(null);
      fetchAdmins();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const columns = [
    {
      header: 'Staff Member',
      render: (a) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-navy-800 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
            {a.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-navy-900 text-xs flex items-center gap-1.5">
              {a.name}
              {a._id === currentAdmin?._id && (
                <span className="badge bg-primary-100 text-primary-800 text-[9px]">You</span>
              )}
            </p>
            <p className="text-[11px] text-gray-400">{a.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Assigned Role',
      render: (a) => (
        <span className="badge bg-navy-100 text-navy-900 uppercase font-bold text-[10px]">
          {a.role?.replace(/_/g, ' ')}
        </span>
      )
    },
    {
      header: 'Status',
      render: (a) => (
        <span className={`badge ${a.isActive ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'}`}>
          {a.isActive ? 'Active' : 'Disabled'}
        </span>
      )
    },
    {
      header: 'Created On',
      render: (a) => (
        <span className="text-xs text-gray-400">
          {new Date(a.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (a) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => openEditModal(a)}
            className="p-1.5 text-gray-400 hover:text-navy-900 rounded-lg hover:bg-gray-100"
            title="Edit Role / Info"
          >
            <Edit size={14} />
          </button>
          {a._id !== currentAdmin?._id && (
            <>
              <button
                onClick={() => handleToggleStatus(a._id)}
                className={`p-1.5 rounded-lg ${
                  a.isActive ? 'text-gray-400 hover:text-rose-600 hover:bg-rose-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                }`}
                title={a.isActive ? 'Disable Access' : 'Enable Access'}
              >
                {a.isActive ? <UserX size={14} /> : <ShieldCheck size={14} />}
              </button>
              <button
                onClick={() => setDeleteId(a._id)}
                className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                title="Delete Admin"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Staff & Role-Based Access"
        subtitle="Manage pharmacy staff accounts, assigned privileges (Super Admin, Pharmacist, Order Manager, Catalog Manager)"
        actions={
          <button onClick={openCreateModal} className="btn-primary text-xs">
            <Plus size={15} /> Add Staff Account
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={admins}
        loading={loading}
        emptyMessage="No admin accounts found."
      />

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-navy-900 text-base">
                {editingAdmin ? 'Edit Staff Member' : 'Create Staff Member'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-navy-900 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Kumar"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rajesh@carewell.com"
                  required
                  disabled={!!editingAdmin}
                  className="input disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="label">Role & Access Level *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  {editingAdmin ? 'New Password (leave blank to keep current)' : 'Account Password *'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingAdmin ? '••••••••' : 'Min 6 characters'}
                  required={!editingAdmin}
                  className="input"
                />
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
                  {submitting ? 'Saving...' : editingAdmin ? 'Update Staff' : 'Create Staff'}
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
        title="Delete Staff Account"
        message="Are you sure you want to revoke and delete this administrative account?"
        danger={true}
      />
    </div>
  );
}
