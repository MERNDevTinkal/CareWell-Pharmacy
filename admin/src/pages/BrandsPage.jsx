import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Globe, Tag } from 'lucide-react';
import { brandService } from '../services/brandService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo: '',
    website: '',
    isActive: true,
    featured: false
  });

  const fetchBrands = () => {
    setLoading(true);
    brandService.getBrands()
      .then((res) => setBrands(res.data?.data || []))
      .catch(() => toast.error('Failed to load brands'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openCreateModal = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      logo: '',
      website: '',
      isActive: true,
      featured: false
    });
    setModalOpen(true);
  };

  const openEditModal = (b) => {
    setEditingBrand(b);
    setFormData({
      name: b.name || '',
      slug: b.slug || '',
      description: b.description || '',
      logo: b.logo || '',
      website: b.website || '',
      isActive: b.isActive ?? true,
      featured: b.featured ?? false
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Brand name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBrand) {
        await brandService.updateBrand(editingBrand._id, formData);
        toast.success('Brand updated successfully');
      } else {
        await brandService.createBrand(formData);
        toast.success('Brand created successfully');
      }
      setModalOpen(false);
      fetchBrands();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await brandService.deleteBrand(deleteId);
      toast.success('Brand removed successfully');
      setDeleteId(null);
      fetchBrands();
    } catch (err) {
      toast.error(err.message || 'Failed to delete brand');
    }
  };

  const columns = [
    {
      header: 'Brand',
      render: (b) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1 flex-shrink-0">
            {b.logo ? (
              <img src={b.logo} alt="" className="max-h-full max-w-full object-contain" />
            ) : (
              <Tag size={18} className="text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-bold text-navy-900">{b.name}</p>
            <p className="text-[11px] text-gray-400 font-mono">/{b.slug}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Website',
      render: (b) => (
        b.website ? (
          <a
            href={b.website}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-primary-600 hover:underline flex items-center gap-1"
          >
            <Globe size={12} /> {b.website.replace(/^https?:\/\//, '')}
          </a>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )
      )
    },
    {
      header: 'Products',
      render: (b) => (
        <span className="badge bg-gray-100 text-gray-700 font-bold">
          {b.productCount ?? 0} items
        </span>
      )
    },
    {
      header: 'Featured',
      render: (b) => (
        <span className={`badge ${b.featured ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-400'}`}>
          {b.featured ? 'Featured' : 'Standard'}
        </span>
      )
    },
    {
      header: 'Status',
      render: (b) => (
        <span className={`badge ${b.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
          {b.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (b) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openEditModal(b)}
            className="p-1.5 text-gray-400 hover:text-navy-900 rounded-lg hover:bg-gray-100"
            title="Edit Brand"
          >
            <Edit size={15} />
          </button>
          <button
            onClick={() => setDeleteId(b._id)}
            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
            title="Delete Brand"
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
        title="Brands & Manufacturers"
        subtitle="Manage pharmaceutical partners, manufacturer details, and brand logos"
        actions={
          <button onClick={openCreateModal} className="btn-primary text-xs">
            <Plus size={15} /> Add Brand
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={brands}
        loading={loading}
        emptyMessage="No brands found. Click 'Add Brand' to create one."
      />

      {/* Add / Edit Brand Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-navy-900 text-base">
                {editingBrand ? 'Edit Brand' : 'Create New Brand'}
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
                <label className="label">Brand Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Cipla / Sun Pharma / Himalaya"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="label">Logo URL</label>
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://... or placeholder URL"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Official Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Manufacturer history or certifications..."
                  className="input"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-xs font-semibold text-navy-800">Featured Brand</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-xs font-semibold text-navy-800">Active</span>
                </label>
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
                  {submitting ? 'Saving...' : editingBrand ? 'Update Brand' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Brand"
        message="Are you sure you want to delete this brand?"
        danger={true}
      />
    </div>
  );
}
