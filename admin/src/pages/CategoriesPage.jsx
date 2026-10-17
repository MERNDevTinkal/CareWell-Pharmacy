import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Layers, CheckCircle, XCircle } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#10b981',
    image: '',
    isVisible: true,
    featured: false,
    displayOrder: 0
  });

  const fetchCategories = () => {
    setLoading(true);
    categoryService.getCategories()
      .then((res) => setCategories(res.data?.data || []))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#10b981',
      image: '',
      isVisible: true,
      featured: false,
      displayOrder: categories.length + 1
    });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      color: cat.color || '#10b981',
      image: cat.image || '',
      isVisible: cat.isVisible ?? true,
      featured: cat.featured ?? false,
      displayOrder: cat.displayOrder ?? 0
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        displayOrder: parseInt(formData.displayOrder, 10) || 0
      };

      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, payload);
        toast.success('Category updated successfully');
      } else {
        await categoryService.createCategory(payload);
        toast.success('Category created successfully');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await categoryService.deleteCategory(deleteId);
      toast.success('Category removed successfully');
      setDeleteId(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    }
  };

  const columns = [
    {
      header: 'Category',
      render: (cat) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0"
            style={{ backgroundColor: cat.color || '#10b981' }}
          >
            {cat.image ? (
              <img src={cat.image} alt="" className="w-full h-full object-cover rounded-xl" />
            ) : (
              cat.name[0]?.toUpperCase()
            )}
          </div>
          <div>
            <p className="font-bold text-navy-900">{cat.name}</p>
            <p className="text-[11px] text-gray-400 font-mono">/{cat.slug}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Products',
      render: (cat) => (
        <span className="badge bg-gray-100 text-gray-700 font-bold">
          {cat.productCount ?? 0} items
        </span>
      )
    },
    {
      header: 'Display Order',
      render: (cat) => <span className="text-xs font-semibold text-gray-600">#{cat.displayOrder ?? 0}</span>
    },
    {
      header: 'Featured',
      render: (cat) => (
        <span className={`badge ${cat.featured ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-400'}`}>
          {cat.featured ? 'Featured' : 'Standard'}
        </span>
      )
    },
    {
      header: 'Visibility',
      render: (cat) => (
        <span className={`badge ${cat.isVisible ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'}`}>
          {cat.isVisible ? 'Visible' : 'Hidden'}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (cat) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openEditModal(cat)}
            className="p-1.5 text-gray-400 hover:text-navy-900 rounded-lg hover:bg-gray-100"
            title="Edit Category"
          >
            <Edit size={15} />
          </button>
          <button
            onClick={() => setDeleteId(cat._id)}
            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
            title="Delete Category"
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
        title="Categories Management"
        subtitle="Manage product categories, theme colors, navigation order, and visibility"
        actions={
          <button onClick={openCreateModal} className="btn-primary text-xs">
            <Plus size={15} /> Add Category
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        emptyMessage="No categories found. Click 'Add Category' to create one."
      />

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-navy-900 text-base">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
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
                <label className="label">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vitamins & Supplements"
                  required
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Slug (Optional)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-10 p-0 rounded-lg cursor-pointer border border-gray-200"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://... or placeholder URL"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short category summary..."
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-xs font-semibold text-navy-800">Featured in Home</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVisible}
                      onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-xs font-semibold text-navy-800">Visible on Store</span>
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
                  {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
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
        title="Delete Category"
        message="Are you sure you want to delete this category? Make sure no active products are assigned to it."
        danger={true}
      />
    </div>
  );
}
