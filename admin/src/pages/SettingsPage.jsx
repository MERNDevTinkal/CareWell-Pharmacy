import { useState, useEffect } from 'react';
import { Save, Store, Truck, Bell, Share2, Globe, Shield } from 'lucide-react';
import { settingsService } from '../services/settingsService';
import PageHeader from '../components/ui/PageHeader';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    storeName: 'CareWell Pharmacy',
    storeTagline: 'Your Health, Our Priority',
    storeLogo: '/uploads/logo.png',
    primaryColor: '#10b981',
    secondaryColor: '#0f172a',
    contactEmail: 'support@carewell.com',
    contactPhone: '+91 98765 43210',
    contactAddress: '123, Health Street, MG Road, Bangalore - 560001',
    currency: 'INR',
    currencySymbol: '₹',
    shippingCharge: 49,
    freeShippingThreshold: 599,
    taxRate: 12,
    returnWindow: 7,
    codAvailable: true,
    announcementBar: {
      enabled: true,
      text: 'Free shipping on orders above ₹599! Use code WELCOME10 for 10% off your first order.',
      link: '/products',
      bgColor: '#10b981',
      textColor: '#ffffff'
    },
    socialMedia: {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com'
    },
    seoTitle: 'CareWell Pharmacy - Your Trusted Online Pharmacy',
    seoDescription: 'Shop medicines, healthcare products, and wellness essentials.',
    copyrightText: '© 2025 CareWell Pharmacy. All rights reserved.'
  });

  useEffect(() => {
    settingsService.getSettings()
      .then((res) => {
        const map = res.data?.data?.settingsMap;
        if (map) {
          setSettings((prev) => ({
            ...prev,
            ...map
          }));
        }
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNestedChange = (group, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...settings,
        shippingCharge: parseFloat(settings.shippingCharge) || 0,
        freeShippingThreshold: parseFloat(settings.freeShippingThreshold) || 0,
        taxRate: parseFloat(settings.taxRate) || 0,
        returnWindow: parseInt(settings.returnWindow, 10) || 7
      };

      await settingsService.updateSettings(payload);
      toast.success('Store settings saved successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Store Settings & Branding"
        subtitle="Configure dynamic pharmacy branding, theme colors, shipping fee rules, announcement banner, and contact details"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand Identity & Theme */}
        <div className="card p-6 bg-white space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Store size={16} className="text-primary-500" /> Brand Identity & Theme Colors
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Store Brand Name *</label>
              <input
                type="text"
                name="storeName"
                value={settings.storeName}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Brand Tagline</label>
              <input
                type="text"
                name="storeTagline"
                value={settings.storeTagline}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="label">Primary Theme Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="primaryColor"
                  value={settings.primaryColor || '#10b981'}
                  onChange={handleChange}
                  className="w-10 h-10 p-0 rounded-lg cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  name="primaryColor"
                  value={settings.primaryColor}
                  onChange={handleChange}
                  className="input font-mono"
                />
              </div>
            </div>

            <div>
              <label className="label">Secondary (Navy) Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="secondaryColor"
                  value={settings.secondaryColor || '#0f172a'}
                  onChange={handleChange}
                  className="w-10 h-10 p-0 rounded-lg cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  name="secondaryColor"
                  value={settings.secondaryColor}
                  onChange={handleChange}
                  className="input font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Checkout Rules */}
        <div className="card p-6 bg-white space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Truck size={16} className="text-primary-500" /> Shipping & Checkout Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Standard Shipping Fee (₹)</label>
              <input
                type="number"
                name="shippingCharge"
                value={settings.shippingCharge}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="label">Free Shipping Minimum (₹)</label>
              <input
                type="number"
                name="freeShippingThreshold"
                value={settings.freeShippingThreshold}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="label">GST / Tax Rate (%)</label>
              <input
                type="number"
                name="taxRate"
                value={settings.taxRate}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="label">Return Window (Days)</label>
              <input
                type="number"
                name="returnWindow"
                value={settings.returnWindow}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              name="codAvailable"
              checked={settings.codAvailable}
              onChange={handleChange}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <span className="text-xs font-semibold text-navy-800">
              Enable Cash on Delivery (COD) payment option
            </span>
          </label>
        </div>

        {/* Top Announcement Bar */}
        <div className="card p-6 bg-white space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Bell size={16} className="text-primary-500" /> Storefront Announcement Banner
          </h3>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.announcementBar?.enabled ?? true}
              onChange={(e) => handleNestedChange('announcementBar', 'enabled', e.target.checked)}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <span className="text-xs font-semibold text-navy-800">Enable Announcement Bar</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Banner Text</label>
              <input
                type="text"
                value={settings.announcementBar?.text || ''}
                onChange={(e) => handleNestedChange('announcementBar', 'text', e.target.value)}
                placeholder="e.g. Free shipping on orders above ₹599!"
                className="input"
              />
            </div>

            <div>
              <label className="label">Banner Click Link</label>
              <input
                type="text"
                value={settings.announcementBar?.link || ''}
                onChange={(e) => handleNestedChange('announcementBar', 'link', e.target.value)}
                placeholder="/products"
                className="input"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Background Color</label>
                <input
                  type="text"
                  value={settings.announcementBar?.bgColor || '#10b981'}
                  onChange={(e) => handleNestedChange('announcementBar', 'bgColor', e.target.value)}
                  className="input font-mono"
                />
              </div>
              <div>
                <label className="label">Text Color</label>
                <input
                  type="text"
                  value={settings.announcementBar?.textColor || '#ffffff'}
                  onChange={(e) => handleNestedChange('announcementBar', 'textColor', e.target.value)}
                  className="input font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card p-6 bg-white space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2">
            Contact & Support Info
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Support Email</label>
              <input
                type="email"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="label">Helpline Phone Number</label>
              <input
                type="text"
                name="contactPhone"
                value={settings.contactPhone}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Physical Pharmacy Address</label>
            <input
              type="text"
              name="contactAddress"
              value={settings.contactAddress}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        {/* Social Media Links */}
        <div className="card p-6 bg-white space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Share2 size={16} className="text-primary-500" /> Social Channels
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Facebook Page URL</label>
              <input
                type="url"
                value={settings.socialMedia?.facebook || ''}
                onChange={(e) => handleNestedChange('socialMedia', 'facebook', e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="label">Twitter / X URL</label>
              <input
                type="url"
                value={settings.socialMedia?.twitter || ''}
                onChange={(e) => handleNestedChange('socialMedia', 'twitter', e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="label">Instagram URL</label>
              <input
                type="url"
                value={settings.socialMedia?.instagram || ''}
                onChange={(e) => handleNestedChange('socialMedia', 'instagram', e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="label">YouTube Channel URL</label>
              <input
                type="url"
                value={settings.socialMedia?.youtube || ''}
                onChange={(e) => handleNestedChange('socialMedia', 'youtube', e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Legal & Footer */}
        <div className="card p-6 bg-white space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2">
            Footer Copyright
          </h3>

          <div>
            <label className="label">Footer Copyright Notice</label>
            <input
              type="text"
              name="copyrightText"
              value={settings.copyrightText}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-sm px-6 py-3"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
