import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import ProtectedAdminRoute from './routes/ProtectedAdminRoute';

import AdminLoginPage from './pages/AdminLoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import CategoriesPage from './pages/CategoriesPage';
import BrandsPage from './pages/BrandsPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import InventoryPage from './pages/InventoryPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import CouponsPage from './pages/CouponsPage';
import ReviewsPage from './pages/ReviewsPage';
import EnquiriesPage from './pages/EnquiriesPage';
import HomepageBuilderPage from './pages/HomepageBuilderPage';
import CMSPagesPage from './pages/CMSPagesPage';
import CMSPageEditorPage from './pages/CMSPageEditorPage';
import FAQPage from './pages/FAQPage';
import BlogsPage from './pages/BlogsPage';
import BlogEditorPage from './pages/BlogEditorPage';
import NavigationPage from './pages/NavigationPage';
import MediaLibraryPage from './pages/MediaLibraryPage';
import SettingsPage from './pages/SettingsPage';
import AdminUsersPage from './pages/AdminUsersPage';

export default function App() {
  return (
    <Routes>
      {/* Admin Login Route */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Redirect Root to /admin */}
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* Protected Admin Suite Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        
        {/* Catalog */}
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/edit/:slug" element={<ProductFormPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="brands" element={<BrandsPage />} />

        {/* Orders & Fulfillment */}
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="prescriptions" element={<PrescriptionsPage />} />
        <Route path="inventory" element={<InventoryPage />} />

        {/* Customers & Engagement */}
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />
        <Route path="coupons" element={<CouponsPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="enquiries" element={<EnquiriesPage />} />

        {/* Content & Storefront */}
        <Route path="homepage-builder" element={<HomepageBuilderPage />} />
        <Route path="cms-pages" element={<CMSPagesPage />} />
        <Route path="cms-pages/new" element={<CMSPageEditorPage />} />
        <Route path="cms-pages/edit/:id" element={<CMSPageEditorPage />} />
        <Route path="faqs" element={<FAQPage />} />
        <Route path="blogs" element={<BlogsPage />} />
        <Route path="blogs/new" element={<BlogEditorPage />} />
        <Route path="blogs/edit/:id" element={<BlogEditorPage />} />
        <Route path="navigation" element={<NavigationPage />} />
        <Route path="media" element={<MediaLibraryPage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* Staff & System Access (Super Admin only) */}
        <Route
          path="users"
          element={
            <ProtectedAdminRoute requiredRole="super_admin">
              <AdminUsersPage />
            </ProtectedAdminRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
