import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export default function ProtectedAdminRoute({ children, requiredRole }) {
  const { admin, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent" />
          <p className="text-xs font-semibold text-gray-500">Checking admin authorization...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requiredRole && admin.role !== 'super_admin' && admin.role !== requiredRole) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
