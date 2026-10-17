import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, Compass, ExternalLink } from 'lucide-react';
import { settingsService } from '../services/settingsService';
import PageHeader from '../components/ui/PageHeader';
import toast from 'react-hot-toast';

export default function NavigationPage() {
  const [menus, setMenus] = useState([]);
  const [activeLocation, setActiveLocation] = useState('header');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Active menu items being edited
  const [currentItems, setCurrentItems] = useState([]);

  // New item input
  const [newItem, setNewItem] = useState({ label: '', url: '', target: '_self' });

  const locations = [
    { key: 'header', label: 'Main Header Navigation' },
    { key: 'footer_col1', label: 'Footer Column 1 (About/Company)' },
    { key: 'footer_col2', label: 'Footer Column 2 (Customer Care)' },
    { key: 'footer_col3', label: 'Footer Column 3 (Legal & Policies)' },
    { key: 'footer_bottom', label: 'Footer Bottom Bar' }
  ];

  const fetchNavigation = () => {
    setLoading(true);
    settingsService.getNavigation()
      .then((res) => {
        const list = res.data?.data || [];
        setMenus(list);
        const active = list.find((m) => m.location === activeLocation);
        setCurrentItems(active?.items || []);
      })
      .catch(() => toast.error('Failed to load navigation'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNavigation();
  }, []);

  useEffect(() => {
    const active = menus.find((m) => m.location === activeLocation);
    setCurrentItems(active?.items || []);
  }, [activeLocation, menus]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.label || !newItem.url) {
      toast.error('Label and URL are required');
      return;
    }

    setCurrentItems([
      ...currentItems,
      {
        ...newItem,
        order: currentItems.length + 1
      }
    ]);
    setNewItem({ label: '', url: '', target: '_self' });
  };

  const handleRemoveItem = (index) => {
    setCurrentItems(currentItems.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...currentItems];
    updated[index][field] = value;
    setCurrentItems(updated);
  };

  const handleSaveMenu = async () => {
    setSaving(true);
    try {
      const activeLocObj = locations.find(l => l.key === activeLocation);
      await settingsService.updateNavigation({
        location: activeLocation,
        name: activeLocObj?.label || activeLocation,
        items: currentItems.map((item, idx) => ({ ...item, order: idx + 1 }))
      });
      toast.success('Navigation menu saved');
      fetchNavigation();
    } catch (err) {
      toast.error(err.message || 'Failed to save navigation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Navigation Menus Editor"
        subtitle="Customize header and footer navigation links, internal links, and external redirects"
      />

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        {locations.map((loc) => (
          <button
            key={loc.key}
            onClick={() => setActiveLocation(loc.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeLocation === loc.key
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-navy-900 hover:bg-gray-100'
            }`}
          >
            {loc.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card bg-white p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2">
                <Compass size={16} className="text-primary-500" /> Menu Items ({currentItems.length})
              </h3>
              <button
                onClick={handleSaveMenu}
                disabled={saving}
                className="btn-primary text-xs px-4 py-2"
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save Menu'}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" />
              </div>
            ) : currentItems.length > 0 ? (
              <div className="space-y-3">
                {currentItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-gray-200 rounded-xl bg-gray-50/50 flex flex-col sm:flex-row items-center gap-3"
                  >
                    <span className="w-6 h-6 rounded-md bg-gray-200 text-gray-600 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>

                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => handleItemChange(idx, 'label', e.target.value)}
                      placeholder="Display Label"
                      className="input text-xs sm:w-1/3"
                    />

                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => handleItemChange(idx, 'url', e.target.value)}
                      placeholder="/link-or-url"
                      className="input text-xs flex-1 font-mono"
                    />

                    <select
                      value={item.target || '_self'}
                      onChange={(e) => handleItemChange(idx, 'target', e.target.value)}
                      className="input text-xs sm:w-28"
                    >
                      <option value="_self">Same Tab</option>
                      <option value="_blank">New Tab</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic py-6 text-center">
                No items in this menu. Add one below.
              </p>
            )}
          </div>
        </div>

        {/* Add New Item Card */}
        <div className="space-y-4">
          <div className="card bg-white p-6 space-y-4">
            <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-3">
              <Plus size={16} className="text-primary-500" /> Add Navigation Item
            </h3>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="label">Link Title / Label *</label>
                <input
                  type="text"
                  value={newItem.label}
                  onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                  placeholder="e.g. Health Blogs"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="label">URL / Path *</label>
                <input
                  type="text"
                  value={newItem.url}
                  onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                  placeholder="e.g. /blog or https://..."
                  required
                  className="input font-mono text-xs"
                />
              </div>

              <div>
                <label className="label">Open In</label>
                <select
                  value={newItem.target}
                  onChange={(e) => setNewItem({ ...newItem, target: e.target.value })}
                  className="input text-xs"
                >
                  <option value="_self">Same Window (_self)</option>
                  <option value="_blank">New Tab (_blank)</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-primary w-full text-xs py-2.5 justify-center mt-2"
              >
                <Plus size={14} /> Add to Menu
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
