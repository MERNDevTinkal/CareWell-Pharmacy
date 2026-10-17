import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import ProductCard from '../components/product/ProductCard';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton';
import Breadcrumb from '../components/ui/Breadcrumb';
import EmptyState from '../components/ui/EmptyState';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    productService.searchProducts(q)
      .then(res => setProducts(res.data?.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb items={[{ label: 'Search', url: '/search' }, { label: q }]} />

      <div>
        <h1 className="text-2xl font-black text-navy-900">
          Search Results for "{q}"
        </h1>
        <p className="text-xs text-gray-500 mt-1">Found {products.length} matching products</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No Products Found"
          description={`We couldn't find any pharmacy items matching "${q}". Try checking for spelling errors or searching for a general category.`}
          actionText="Browse All Products"
          actionLink="/products"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(p => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

