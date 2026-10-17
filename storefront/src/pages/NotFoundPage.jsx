import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="card p-12 text-center max-w-md w-full space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto text-3xl font-black">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-navy-900">Page Not Found</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            The page you're looking for doesn't exist or may have been moved. Return to the pharmacy homepage or browse our catalog.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link to="/" className="btn-primary text-xs">
            <Home size={15} /> Return Home
          </Link>
          <Link to="/products" className="btn-outline text-xs">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}

