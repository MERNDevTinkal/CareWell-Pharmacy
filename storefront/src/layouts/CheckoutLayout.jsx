import { Outlet, Link } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';

export default function CheckoutLayout() {
  const { settings } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Minimal Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary-500 text-white font-bold text-lg flex items-center justify-center">
              C
            </div>
            <span className="text-xl font-extrabold text-navy-900 tracking-tight">
              {settings?.storeName || 'CareWell Pharmacy'}
            </span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Lock size={14} className="text-primary-600" />
            <span>256-bit Secure Checkout</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>

      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-200">
        <p>© 2026 {settings?.storeName || 'CareWell Pharmacy'}. All transactions are encrypted and secured.</p>
      </footer>
    </div>
  );
}
