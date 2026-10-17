import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  ShoppingBag,
  FileCheck,
  Users,
  Warehouse,
  Ticket,
  Star,
  LayoutTemplate,
  FileText,
  HelpCircle,
  BookOpen,
  Compass,
  Settings,
  Image,
  Shield,
  MessageSquare,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const navSections = [
    {
      title: 'Main',
      items: [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }
      ]
    },
    {
      title: 'Catalog',
      items: [
        { to: '/admin/products', label: 'Products', icon: Package },
        { to: '/admin/categories', label: 'Categories', icon: Layers },
        { to: '/admin/brands', label: 'Brands', icon: Tag }
      ]
    },
    {
      title: 'Orders & Fulfillment',
      items: [
        { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
        { to: '/admin/prescriptions', label: 'Prescriptions', icon: FileCheck },
        { to: '/admin/inventory', label: 'Inventory & Batches', icon: Warehouse }
      ]
    },
    {
      title: 'Customers & Engagement',
      items: [
        { to: '/admin/customers', label: 'Customers', icon: Users },
        { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
        { to: '/admin/reviews', label: 'Reviews', icon: Star },
        { to: '/admin/enquiries', label: 'Inquiries', icon: MessageSquare }
      ]
    },
    {
      title: 'Content & Storefront',
      items: [
        { to: '/admin/homepage-builder', label: 'Homepage Builder', icon: LayoutTemplate },
        { to: '/admin/cms-pages', label: 'CMS Policy Pages', icon: FileText },
        { to: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
        { to: '/admin/blogs', label: 'Health Blog', icon: BookOpen },
        { to: '/admin/navigation', label: 'Navigation Menus', icon: Compass },
        { to: '/admin/media', label: 'Media Library', icon: Image },
        { to: '/admin/settings', label: 'Store Settings', icon: Settings }
      ]
    },
    ...(admin?.role === 'super_admin' ? [{
      title: 'System Access',
      items: [
        { to: '/admin/users', label: 'Staff & Roles', icon: Shield }
      ]
    }] : [])
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 text-navy-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-navy-900 text-gray-300 w-64 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-navy-800">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-500 text-white font-black flex items-center justify-center text-base">
                C
              </div>
              {sidebarOpen && (
                <div className="min-w-0">
                  <span className="font-extrabold text-white text-sm tracking-tight block">CareWell</span>
                  <span className="text-[10px] text-primary-400 font-bold uppercase tracking-wider block">Admin Suite</span>
                </div>
              )}
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
            {navSections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {sidebarOpen && (
                  <p className="px-3 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                    {sec.title}
                  </p>
                )}
                {sec.items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                          : 'text-gray-300 hover:text-white hover:bg-navy-800'
                      }`
                    }
                    title={!sidebarOpen ? label : undefined}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    {sidebarOpen && <span className="truncate">{label}</span>}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </div>

        {/* User Info & Storefront Quicklink at Sidebar bottom */}
        <div className="p-3 border-t border-navy-800 space-y-2">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-primary-400 hover:bg-navy-800 transition-colors"
          >
            <ExternalLink size={14} />
            {sidebarOpen && <span>View Storefront</span>}
          </a>

          <div className="flex items-center justify-between px-3 py-2 bg-navy-800/60 rounded-xl">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-primary-500 text-white font-bold text-xs flex items-center justify-center">
                {admin?.name?.[0] || 'A'}
              </div>
              {sidebarOpen && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{admin?.name}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{admin?.role?.replace(/_/g, ' ')}</p>
                </div>
              )}
            </div>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-rose-400 p-1"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-500 hover:text-navy-900 rounded-lg hover:bg-gray-100"
            >
              <Menu size={18} />
            </button>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">
              Management Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="badge bg-primary-100 text-primary-800 font-bold uppercase text-[10px]">
              {admin?.role?.replace(/_/g, ' ')}
            </span>
            <div className="h-4 w-px bg-gray-200" />
            <span className="text-xs font-bold text-navy-900">{admin?.name}</span>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
