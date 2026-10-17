import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AccountLayout from './layouts/AccountLayout';
import CheckoutLayout from './layouts/CheckoutLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Public pages
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import SearchPage from './pages/SearchPage';
import UploadPrescriptionPage from './pages/UploadPrescriptionPage';
import CMSPage from './pages/CMSPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import NotFoundPage from './pages/NotFoundPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Checkout pages
import CheckoutPage from './pages/checkout/CheckoutPage';
import OrderSuccessPage from './pages/checkout/OrderSuccessPage';

// Account pages
import DashboardPage from './pages/account/DashboardPage';
import OrdersPage from './pages/account/OrdersPage';
import OrderDetailPage from './pages/account/OrderDetailPage';
import ProfilePage from './pages/account/ProfilePage';
import AddressesPage from './pages/account/AddressesPage';
import WishlistPage from './pages/account/WishlistPage';
import PrescriptionsPage from './pages/account/PrescriptionsPage';
import ChangePasswordPage from './pages/account/ChangePasswordPage';

import LoadingSpinner from './components/ui/LoadingSpinner';

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" text="Loading CareWell Pharmacy..." />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Main Customer Public Layout */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/category/:slug" element={<ProductListPage />} />
          <Route path="/brand/:slug" element={<ProductListPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/upload-prescription" element={<UploadPrescriptionPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/pages/:slug" element={<CMSPage />} />
          <Route path="/about" element={<CMSPage slug="about-us" />} />
        </Route>

        {/* Auth Pages (standalone minimal layout) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Checkout Layout */}
        <Route element={<CheckoutLayout />}>
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route path="/order-success/:id" element={<OrderSuccessPage />} />
        </Route>

        {/* Customer Account Protected Area */}
        <Route
          element={
            <ProtectedRoute>
              <AccountLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/account" element={<DashboardPage />} />
          <Route path="/account/orders" element={<OrdersPage />} />
          <Route path="/account/orders/:id" element={<OrderDetailPage />} />
          <Route path="/account/profile" element={<ProfilePage />} />
          <Route path="/account/addresses" element={<AddressesPage />} />
          <Route path="/account/wishlist" element={<WishlistPage />} />
          <Route path="/account/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/account/change-password" element={<ChangePasswordPage />} />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
