import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Star, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Deletion modal state
  const [deleteId, setDeleteId] = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    productService.getProducts({
      page,
      limit: 10,
      search: search || undefined,
      category: category || undefined
    })
      .then(res => {
        setProducts(res.data?.data || []);
        if (res.data?.pagination) {
          setPages(res.data.pagination.pages);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    categoryService.getCategories().then(res => setCategories(res.data?.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleToggleFeatured = async (id) => {
    try {
      await productService.toggleFeatured(id);
      toast.success('Updated featured status');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to update product');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await productService.deleteProduct(deleteId);
      toast.success('Product removed successfully');
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const columns = [
    {
      header: 'Product',
      render: (p) => (
        <div className="flex items-center gap-3">
          <img
            src={p.images?.[0]?.url || 'https://placehold.co/100x100?text=Medicine'}
            alt=""
            className="w-10 h-10 object-contain rounded-lg bg-gray-50 p-1 border border-gray-100 flex-shrink-0"
          />
          <div className="min-w-0 max-w-xs">
            <p className="font-bold text-navy-900 truncate">{p.name}</p>
            <p className="text-[11px] text-gray-400 font-mono">SKU: {p.sku}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Category & Brand',
      render: (p) => (
        <div>
          <p className="font-semibold text-navy-900">{p.category?.name || '—'}</p>
          <p className="text-gray-400 text-[11px]">{p.brand?.name || '—'}</p>
        </div>
      )
    },
    {
      header: 'Pricing',
      render: (p) => (
        <div>
          <span className="font-bold text-navy-900">₹{p.price}</span>
          {p.mrp > p.price && (
            <span className="text-gray-400 text-[11px] line-through ml-1.5">₹{p.mrp}</span>
          )}
        </div>
      )
    },
    {
      header: 'Stock',
      render: (p) => (
        <span className={`badge ${p.stock > 10 ? 'bg-green-100 text-green-800' : p.stock > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
          {p.stock} units
        </span>
      )
    },
    {
      header: 'Rx Required',
      render: (p) => (
        p.prescriptionRequired ? (
          <span className="badge bg-amber-100 text-amber-800 flex items-center gap-1 w-max">
            <ShieldAlert size={10} /> Rx
          </span>
        ) : (
          <span className="badge bg-gray-100 text-gray-500">OTC</span>
        )
      )
    },
    {
      header: 'Featured',
      render: (p) => (
        <button
          onClick={() => handleToggleFeatured(p._id)}
          className={`p-1.5 rounded-lg transition-colors ${p.isFeatured ? 'text-amber-500 bg-amber-50' : 'text-gray-300 hover:text-amber-400'}`}
          title="Toggle Featured"
        >
          <Star size={16} fill={p.isFeatured ? 'currentColor' : 'none'} />
        </button>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/admin/products/edit/${p.slug}`}
            className="p-1.5 text-gray-400 hover:text-navy-900 rounded-lg hover:bg-gray-100"
            title="Edit"
          >
            <Edit size={15} />
          </Link>
          <button
            onClick={() => setDeleteId(p._id)}
            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
            title="Delete"
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
        title="Products Management"
        subtitle="View, create, edit catalog items, control stock, and set prescription requirements"
        actions={
          <Link to="/admin/products/new" className="btn-primary text-xs">
            <Plus size={15} /> Add New Product
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="card p-4 bg-white flex flex-col sm:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="input w-full sm:w-48"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        emptyMessage="No products match the selected criteria."
      />

      <Pagination
        page={page}
        pages={pages}
        onPageChange={(p) => setPage(p)}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? It will no longer be visible on the customer website."
        danger={true}
      />
    </div>
  );
}
