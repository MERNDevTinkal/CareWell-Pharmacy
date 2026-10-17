import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  Grid,
  List,
  ChevronDown,
  Check,
  RotateCcw
} from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { brandService } from '../services/brandService';
import ProductCard from '../components/product/ProductCard';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton';
import Breadcrumb from '../components/ui/Breadcrumb';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Current filters from URL search params
  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || '-createdAt';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentInStock = searchParams.get('inStock') === 'true';
  const currentRx = searchParams.get('prescriptionRequired') === 'true';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  // Fetch filters list on mount
  useEffect(() => {
    Promise.all([
      categoryService.getCategories(),
      brandService.getBrands()
    ]).then(([catRes, brandRes]) => {
      setCategories(catRes.data?.data || []);
      setBrands(brandRes.data?.data || []);
    }).catch(() => {});
  }, []);

  // Fetch products whenever params change
  useEffect(() => {
    setLoading(true);
    const params = {
      page: currentPage,
      limit: 12,
      sort: currentSort,
      search: currentSearch || undefined,
      category: currentCategory || undefined,
      brand: currentBrand || undefined,
      inStock: currentInStock ? 'true' : undefined,
      prescriptionRequired: currentRx ? 'true' : undefined,
      minPrice: currentMinPrice || undefined,
      maxPrice: currentMaxPrice || undefined
    };

    productService.getProducts(params)
      .then((res) => {
        setProducts(res.data?.data || []);
        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === undefined || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(next);
  };

  const handlePageChange = (newPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = !!(currentCategory || currentBrand || currentSearch || currentInStock || currentRx || currentMinPrice || currentMaxPrice);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Products', url: '/products' },
          ...(currentCategory ? [{ label: currentCategory }] : [])
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-navy-900 capitalize">
            {currentCategory ? currentCategory.replace(/-/g, ' ') : currentSearch ? `Results for "${currentSearch}"` : 'All Pharmacy Products'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Showing {products.length} of {pagination.total} products
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-navy-800"
          >
            <SlidersHorizontal size={14} /> Filters
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium hidden sm:inline">Sort:</span>
            <select
              value={currentSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="-createdAt">Newest Arrivals</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-salesCount">Best Selling</option>
              <option value="-discount">Biggest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 py-4 flex-wrap text-xs">
          <span className="text-gray-400 font-medium">Active Filters:</span>
          {currentCategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 font-semibold border border-primary-100">
              Category: {currentCategory}
              <button onClick={() => updateParam('category', '')}><X size={12} /></button>
            </span>
          )}
          {currentBrand && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 font-semibold border border-primary-100">
              Brand: {currentBrand}
              <button onClick={() => updateParam('brand', '')}><X size={12} /></button>
            </span>
          )}
          {currentInStock && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 font-semibold border border-primary-100">
              In Stock Only
              <button onClick={() => updateParam('inStock', '')}><X size={12} /></button>
            </span>
          )}
          {currentRx && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200">
              Prescription Only
              <button onClick={() => updateParam('prescriptionRequired', '')}><X size={12} /></button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-rose-600 hover:underline font-bold text-xs inline-flex items-center gap-1 ml-2"
          >
            <RotateCcw size={12} /> Clear All
          </button>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="flex gap-8 pt-6">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-64 flex-shrink-0 space-y-6">
          {/* Categories Filter */}
          <div className="card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-3">Categories</h3>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              <button
                onClick={() => updateParam('category', '')}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !currentCategory ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => updateParam('category', cat.slug)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    currentCategory === cat.slug ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brands Filter */}
          <div className="card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-3">Brands</h3>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              <button
                onClick={() => updateParam('brand', '')}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !currentBrand ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All Brands
              </button>
              {brands.map((b) => (
                <button
                  key={b._id}
                  onClick={() => updateParam('brand', b.slug)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    currentBrand === b.slug ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Availability & Prescription Toggles */}
          <div className="card p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-1">Preferences</h3>
            <label className="flex items-center gap-2.5 text-xs text-navy-800 cursor-pointer">
              <input
                type="checkbox"
                checked={currentInStock}
                onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')}
                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              In-Stock Items Only
            </label>
            <label className="flex items-center gap-2.5 text-xs text-navy-800 cursor-pointer">
              <input
                type="checkbox"
                checked={currentRx}
                onChange={(e) => updateParam('prescriptionRequired', e.target.checked ? 'true' : '')}
                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              Prescription Required (Rx)
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <section className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No Products Match Your Criteria"
              description="Try clearing some of your filters or searching with a different term."
              actionText="Reset Filters"
              onAction={clearAllFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </section>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-navy-900/60 backdrop-blur-sm">
          <div className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <h3 className="text-base font-bold text-navy-900">Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <p className="text-xs uppercase font-bold text-gray-400 mb-2">Category</p>
                <div className="space-y-1">
                  {categories.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => {
                        updateParam('category', c.slug);
                        setMobileFilterOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        currentCategory === c.slug ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="btn-primary w-full justify-center text-xs"
            >
              Apply & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

