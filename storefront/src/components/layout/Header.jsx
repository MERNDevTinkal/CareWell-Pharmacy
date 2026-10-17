import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Upload,
  LogOut,
  Package,
  FileText,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useStore } from '../../contexts/StoreContext';
import { productService } from '../../services/productService';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { itemCount, setCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const { settings, navigation } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await productService.searchProducts(searchQuery);
        setSuggestions(res.data?.data || []);
        setShowSuggestions(true);
      } catch (e) {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listeners
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSelectSuggestion = (product) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/products/${product.slug}`);
  };

  const navItems = navigation?.header || [
    { label: 'All Medicines', url: '/products?category=medicines' },
    { label: 'Vitamins', url: '/products?category=vitamins-supplements' },
    { label: 'Ayurvedic', url: '/products?category=ayurvedic' },
    { label: 'Medical Devices', url: '/products?category=medical-devices' },
    { label: 'Health Blog', url: '/blog' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-navy-700 hover:text-primary-600 rounded-lg"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-primary-200">
              C
            </div>
            <div>
              <span className="text-xl font-extrabold text-navy-900 tracking-tight">
                {settings?.storeName || 'CareWell'}
              </span>
              <span className="hidden sm:block text-[10px] text-primary-600 font-bold uppercase tracking-wider">
                Online Pharmacy
              </span>
            </div>
          </Link>

          {/* Central Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-xl relative hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search medicines, vitamins, brands, devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="w-full pl-11 pr-24 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-navy-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-inner"
              />
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors"
              >
                Search
              </button>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="p-2 text-xs font-semibold uppercase text-gray-400 tracking-wider">
                  Suggested Products
                </div>
                {suggestions.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => handleSelectSuggestion(p)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left border-t border-gray-50 transition-colors"
                  >
                    <img
                      src={p.images?.[0]?.url || 'https://placehold.co/100x100?text=Medicine'}
                      alt={p.name}
                      className="w-10 h-10 object-contain rounded-lg bg-white border border-gray-100 p-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.brand?.name || p.category?.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-primary-600">₹{p.price}</span>
                      {p.discount > 0 && (
                        <span className="block text-[10px] text-green-600 font-semibold">{p.discount}% OFF</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Prescription Upload CTA */}
          <Link
            to="/upload-prescription"
            className="hidden lg:inline-flex items-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors border border-primary-200"
          >
            <Upload size={16} />
            Upload Prescription
          </Link>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wishlist */}
            <Link
              to="/account/wishlist"
              className="p-2 text-navy-700 hover:text-primary-600 hover:bg-gray-50 rounded-xl relative transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={22} />
              {wishlist?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => setCartOpen(true)}
              className="p-2 text-navy-700 hover:text-primary-600 hover:bg-gray-50 rounded-xl relative transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Account / User Menu */}
            <div ref={userMenuRef} className="relative">
              {user ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 text-navy-800 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm flex items-center justify-center border border-primary-200">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:block text-xs font-semibold max-w-[100px] truncate">
                    {user.name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className="text-gray-400 hidden md:block" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                >
                  <User size={15} />
                  Login
                </Link>
              )}

              {/* User Dropdown */}
              {user && userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-bold text-navy-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/account"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-navy-700 hover:bg-gray-50"
                  >
                    <User size={16} className="text-gray-400" /> Account Dashboard
                  </Link>
                  <Link
                    to="/account/orders"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-navy-700 hover:bg-gray-50"
                  >
                    <Package size={16} className="text-gray-400" /> My Orders
                  </Link>
                  <Link
                    to="/account/prescriptions"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-navy-700 hover:bg-gray-50"
                  >
                    <FileText size={16} className="text-gray-400" /> My Prescriptions
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-navy-900"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </form>
        </div>
      </div>

      {/* Desktop Category Navigation Bar */}
      <nav className="bg-gray-50 border-t border-gray-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-8 py-2.5 text-xs font-semibold text-navy-700 overflow-x-auto whitespace-nowrap">
            <li>
              <Link to="/products" className="hover:text-primary-600 transition-colors">
                All Products
              </Link>
            </li>
            {navItems.map((item, idx) => (
              <li key={idx}>
                <Link to={item.url} className="hover:text-primary-600 transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="fixed top-0 bottom-0 left-0 w-4/5 max-w-sm bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <span className="text-lg font-bold text-navy-900">{settings?.storeName || 'CareWell'}</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              <div className="py-4 space-y-2">
                <Link
                  to="/upload-prescription"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 w-full bg-primary-50 text-primary-700 px-4 py-3 rounded-xl font-bold text-sm"
                >
                  <Upload size={18} /> Upload Prescription
                </Link>

                <div className="pt-2">
                  <p className="text-xs uppercase text-gray-400 font-bold px-2 py-1">Catalog</p>
                  <Link
                    to="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-navy-800 rounded-lg hover:bg-gray-50"
                  >
                    All Products
                  </Link>
                  {navItems.map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-navy-800 rounded-lg hover:bg-gray-50"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              {user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 rounded-xl"
                >
                  <LogOut size={16} /> Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-navy-900 rounded-xl"
                >
                  <User size={16} /> Customer Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
