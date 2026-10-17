import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, ShieldCheck, Heart, Award } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Footer() {
  const { settings, navigation } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribing(true);
    try {
      await api.post('/contact/newsletter', { email: newsletterEmail });
      toast.success('Thank you for subscribing to CareWell updates!');
      setNewsletterEmail('');
    } catch (err) {
      toast.error('Subscription failed. Please check your email.');
    } finally {
      setSubscribing(false);
    }
  };

  const col1 = navigation?.footer_col1 || [
    { label: 'About Us', url: '/pages/about-us' },
    { label: 'Health Blog', url: '/blog' },
    { label: 'Contact Us', url: '/contact' }
  ];

  const col2 = navigation?.footer_col2 || [
    { label: 'Frequently Asked Questions', url: '/faq' },
    { label: 'Shipping & Delivery', url: '/pages/shipping-policy' },
    { label: 'Returns & Refunds', url: '/pages/return-refund-policy' },
    { label: 'Upload Prescription', url: '/upload-prescription' }
  ];

  const col3 = navigation?.footer_col3 || [
    { label: 'Privacy Policy', url: '/pages/privacy-policy' },
    { label: 'Terms & Conditions', url: '/pages/terms-conditions' },
    { label: 'Prescription Policy', url: '/pages/prescription-policy' },
    { label: 'Medical Disclaimer', url: '/pages/disclaimer' }
  ];

  return (
    <footer className="bg-navy-900 text-gray-300 pt-16 pb-8 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-primary-900 to-navy-800 rounded-3xl p-8 mb-16 border border-primary-800/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-md">
            <span className="text-primary-400 text-xs font-bold uppercase tracking-wider">Stay Informed</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">Get 10% Off Your Next Order</h3>
            <p className="text-sm text-gray-300 mt-1">
              Subscribe to health tips, medicine reminders, and exclusive seasonal pharmacy deals.
            </p>
          </div>
          <form onSubmit={handleNewsletter} className="w-full md:w-auto flex items-center gap-2 flex-1 max-w-md">
            <input
              type="email"
              placeholder="Enter your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-navy-900/80 border border-primary-500/30 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={subscribing}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2 whitespace-nowrap transition-colors disabled:opacity-50"
            >
              {subscribing ? 'Subscribing...' : 'Subscribe'}
              <Send size={15} />
            </button>
          </form>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-xl">
                C
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                {settings?.storeName || 'CareWell Pharmacy'}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed pr-6">
              {settings?.storeTagline || 'Your trusted online destination for authentic prescription medicines, vitamins, and everyday healthcare essentials.'}
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-primary-400 flex-shrink-0" />
                <span>{settings?.contactAddress || '123 Health Avenue, MG Road, Bangalore - 560001, Karnataka, India'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-primary-400 flex-shrink-0" />
                <span>{settings?.contactPhone || '+91 98765 43210'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-primary-400 flex-shrink-0" />
                <span>{settings?.contactEmail || 'support@carewell.com'}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {col1.map((item, idx) => (
                <li key={idx}>
                  <Link to={item.url} className="text-gray-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm">
              {col2.map((item, idx) => (
                <li key={idx}>
                  <Link to={item.url} className="text-gray-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Policies */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Policies</h4>
            <ul className="space-y-2.5 text-sm">
              {col3.map((item, idx) => (
                <li key={idx}>
                  <Link to={item.url} className="text-gray-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-navy-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>{settings?.copyrightText || '© 2026 CareWell Pharmacy. All rights reserved.'}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-primary-400 font-semibold">
              <ShieldCheck size={14} /> 100% Genuine Medicines
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-primary-400 font-semibold">
              <Award size={14} /> Licensed Pharmacists
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
