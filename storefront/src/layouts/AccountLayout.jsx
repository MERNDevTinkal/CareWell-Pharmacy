import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Package,
  MapPin,
  Heart,
  FileText,
  Lock,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CartDrawer from '../components/cart/CartDrawer';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/account', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/account/profile', label: 'My Profile', icon: User },
  { to: '/account/orders', label: 'My Orders', icon: Package },
  { to: '/account/addresses', label: 'Saved Addresses', icon: MapPin },
  { to: '/account/wishlist', label: 'My Wishlist', icon: Heart },
  { to: '/account/prescriptions', label: 'Prescriptions', icon: FileText },
  { to: '/account/change-password', label: 'Change Password', icon: Lock }
];

export default function AccountLayout() {
  const { user, logout } = useAuth();
  const { cartOpen, setCartOpen } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0 space-y-4">
            {/* User Profile Summary */}
            <div className="card p-5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-primary-200">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-navy-900 text-sm truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Account Navigation */}
            <nav className="card overflow-hidden">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-xs font-semibold border-b border-gray-50 transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-l-4 border-l-primary-500'
                        : 'text-navy-700 hover:bg-gray-50'
                    }`
                  }
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </nav>
          </aside>

          {/* Main Account Page Content */}
          <section className="flex-1 min-w-0">
            <Outlet />
          </section>
        </div>
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
