import { useState, useEffect } from 'react';
import { Warehouse, AlertTriangle, ArrowUpRight, ArrowDownLeft, RotateCcw, Search, Plus, Filter } from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'movements'
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Stock Adjustment Modal
  const [adjustProduct, setAdjustProduct] = useState(null);
  const [adjustType, setAdjustType] = useState('in'); // 'in' | 'out' | 'adjustment'
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = () => {
    setLoading(true);
    inventoryService.getInventory({
      page,
      limit: 12,
      search: search || undefined,
      lowStock: lowStockOnly ? 'true' : undefined
    })
      .then((res) => {
        setProducts(res.data?.data || []);
        if (res.data?.pagination) {
          setPages(res.data.pagination.pages);
        }
      })
      .catch(() => toast.error('Failed to load inventory'))
      .finally(() => setLoading(false));
  };

  const fetchMovements = () => {
    setLoading(true);
    inventoryService.getMovements({ page, limit: 15 })
      .then((res) => {
        setMovements(res.data?.data || []);
        if (res.data?.pagination) {
          setPages(res.data.pagination.pages);
        }
      })
      .catch(() => toast.error('Failed to load stock movements'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchInventory();
    } else {
      fetchMovements();
    }
  }, [activeTab, page, lowStockOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchInventory();
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustQty || isNaN(adjustQty) || Number(adjustQty) < 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    setSubmitting(true);
    try {
      await inventoryService.adjustStock({
        productId: adjustProduct._id,
        type: adjustType,
        quantity: parseInt(adjustQty, 10),
        reason: adjustReason || 'Manual inventory update'
      });
      toast.success('Inventory updated successfully');
      setAdjustProduct(null);
      setAdjustQty('');
      setAdjustReason('');
      fetchInventory();
    } catch (err) {
      toast.error(err.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  const inventoryColumns = [
    {
      header: 'Product',
      render: (p) => (
        <div className="flex items-center gap-3">
          <img
            src={p.images?.[0]?.url || 'https://placehold.co/100x100?text=Med'}
            alt=""
            className="w-10 h-10 object-contain rounded-lg border border-gray-100 bg-gray-50 p-1 flex-shrink-0"
          />
          <div>
            <p className="font-bold text-navy-900 text-xs truncate max-w-xs">{p.name}</p>
            <p className="text-[11px] text-gray-400 font-mono">SKU: {p.sku}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Category & Brand',
      render: (p) => (
        <div className="text-xs">
          <p className="text-navy-900 font-semibold">{p.category?.name || '—'}</p>
          <p className="text-gray-400 text-[10px]">{p.brand?.name || '—'}</p>
        </div>
      )
    },
    {
      header: 'Available Stock',
      render: (p) => (
        <span className={`badge ${
          p.stock <= 0
            ? 'bg-rose-100 text-rose-800'
            : p.stock <= (p.lowStockThreshold || 10)
            ? 'bg-amber-100 text-amber-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {p.stock} units
        </span>
      )
    },
    {
      header: 'Alert Threshold',
      render: (p) => <span className="text-xs text-gray-500">{p.lowStockThreshold || 10} units</span>
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (p) => (
        <button
          onClick={() => {
            setAdjustProduct(p);
            setAdjustType('in');
            setAdjustQty('');
            setAdjustReason('');
          }}
          className="btn-primary text-xs px-3 py-1.5"
        >
          <RotateCcw size={12} /> Adjust Stock
        </button>
      )
    }
  ];

  const movementsColumns = [
    {
      header: 'Date & Time',
      render: (m) => (
        <span className="text-xs text-gray-500">
          {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )
    },
    {
      header: 'Product',
      render: (m) => (
        <div>
          <p className="font-bold text-navy-900 text-xs">{m.product?.name || 'Product'}</p>
          <p className="text-[10px] text-gray-400 font-mono">SKU: {m.product?.sku || 'N/A'}</p>
        </div>
      )
    },
    {
      header: 'Movement Type',
      render: (m) => (
        <span className={`badge ${
          m.type === 'in'
            ? 'bg-green-100 text-green-800'
            : m.type === 'out'
            ? 'bg-rose-100 text-rose-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {m.type?.toUpperCase()}
        </span>
      )
    },
    {
      header: 'Change',
      render: (m) => (
        <span className="text-xs font-mono font-bold">
          {m.previousStock} &rarr; {m.newStock}
        </span>
      )
    },
    {
      header: 'Reason / Ref',
      render: (m) => (
        <div className="text-xs">
          <p className="text-navy-900 font-medium">{m.reason || '—'}</p>
          {m.reference && <p className="text-[10px] text-gray-400 font-mono">{m.reference}</p>}
        </div>
      )
    },
    {
      header: 'Handled By',
      render: (m) => (
        <span className="text-xs text-gray-500">
          {m.performedBy?.name || 'System'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory & Batch Management"
        subtitle="Live warehouse stock tracking, threshold warnings, and audit log of all stock movements"
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => { setActiveTab('inventory'); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'inventory'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-gray-500 hover:text-navy-900 hover:bg-gray-100'
          }`}
        >
          Warehouse Stock Levels
        </button>
        <button
          onClick={() => { setActiveTab('movements'); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'movements'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-gray-500 hover:text-navy-900 hover:bg-gray-100'
          }`}
        >
          Stock Movement Logs
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Search & Low Stock Toggle */}
          <div className="card p-4 bg-white flex flex-col sm:flex-row gap-4 justify-between items-center">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search inventory by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9"
              />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </form>

            <label className="flex items-center gap-2 cursor-pointer w-full sm:w-auto p-2 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => {
                  setLowStockOnly(e.target.checked);
                  setPage(1);
                }}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                <AlertTriangle size={13} className="text-amber-500" /> Low Stock Items Only
              </span>
            </label>
          </div>

          <DataTable
            columns={inventoryColumns}
            data={products}
            loading={loading}
            emptyMessage="No inventory records found."
          />

          <Pagination
            page={page}
            pages={pages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {activeTab === 'movements' && (
        <div className="space-y-4">
          <DataTable
            columns={movementsColumns}
            data={movements}
            loading={loading}
            emptyMessage="No stock movements recorded yet."
          />

          <Pagination
            page={page}
            pages={pages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-navy-900 text-base">Adjust Product Stock</h3>
                <p className="text-xs text-gray-400 truncate max-w-xs">{adjustProduct.name}</p>
              </div>
              <button
                onClick={() => setAdjustProduct(null)}
                className="text-gray-400 hover:text-navy-900 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center text-xs">
              <span className="text-gray-500">Current Warehouse Stock:</span>
              <span className="font-bold text-navy-900 font-mono text-sm">{adjustProduct.stock} units</span>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="label">Adjustment Action</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('in')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                      adjustType === 'in'
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    + Add (In)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('out')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                      adjustType === 'out'
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    - Deduct (Out)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('adjustment')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                      adjustType === 'adjustment'
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Set Exact
                  </button>
                </div>
              </div>

              <div>
                <label className="label">
                  {adjustType === 'adjustment' ? 'New Exact Stock' : 'Quantity Units'} *
                </label>
                <input
                  type="number"
                  min="0"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="Enter quantity..."
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="label">Reason / Reference</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Shipment received / Damaged stock write-off"
                  className="input"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAdjustProduct(null)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Applying...' : 'Apply Stock Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
