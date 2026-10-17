import { useState, useEffect } from 'react';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  LayoutTemplate,
  Layers,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { homepageService } from '../services/homepageService';
import PageHeader from '../components/ui/PageHeader';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export default function HomepageBuilderPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: 'hero_banner',
    title: '',
    subtitle: '',
    description: '',
    image: '',
    ctaText: '',
    ctaLink: '',
    isVisible: true,
    displayOrder: 0
  });

  const fetchSections = () => {
    setLoading(true);
    homepageService.getSections()
      .then((res) => setSections(res.data?.data || []))
      .catch(() => toast.error('Failed to load homepage sections'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const openCreateModal = () => {
    setEditingSection(null);
    setFormData({
      type: 'hero_banner',
      title: '',
      subtitle: '',
      description: '',
      image: '',
      ctaText: 'Shop Now',
      ctaLink: '/products',
      isVisible: true,
      displayOrder: sections.length + 1
    });
    setModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingSection(s);
    setFormData({
      type: s.type || 'hero_banner',
      title: s.title || '',
      subtitle: s.subtitle || '',
      description: s.description || '',
      image: s.image || '',
      ctaText: s.ctaText || '',
      ctaLink: s.ctaLink || '',
      isVisible: s.isVisible ?? true,
      displayOrder: s.displayOrder ?? 0
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSection) {
        await homepageService.updateSection(editingSection._id, formData);
        toast.success('Section updated');
      } else {
        await homepageService.createSection(formData);
        toast.success('Section created');
      }
      setModalOpen(false);
      fetchSections();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVisibility = async (sec) => {
    try {
      await homepageService.updateSection(sec._id, { isVisible: !sec.isVisible });
      toast.success(`Section ${!sec.isVisible ? 'enabled' : 'hidden'}`);
      fetchSections();
    } catch {
      toast.error('Failed to update visibility');
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    const orders = newSections.map((s, idx) => ({
      id: s._id,
      displayOrder: idx + 1
    }));

    setSections(newSections);
    try {
      await homepageService.reorderSections(orders);
      toast.success('Homepage order updated');
    } catch {
      toast.error('Failed to save order');
      fetchSections();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await homepageService.deleteSection(deleteId);
      toast.success('Section removed');
      setDeleteId(null);
      fetchSections();
    } catch {
      toast.error('Failed to delete section');
    }
  };

  const sectionTypeNames = {
    hero_banner: 'Hero Banner',
    category_collection: 'Category Carousel / Grid',
    featured_products: 'Featured Products Section',
    best_sellers: 'Best Sellers Section',
    prescription_promo: 'Upload Prescription Promo CTA',
    wellness_collection: 'Wellness & Supplements Grid',
    testimonials: 'Customer Reviews / Testimonials',
    trust_info: 'Trust Badges & Value Pillars',
    offers: 'Promotional Offers & Banners'
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homepage Layout Builder"
        subtitle="Manage dynamic homepage sections, banner messaging, ordering, and promotional campaigns"
        actions={
          <button onClick={openCreateModal} className="btn-primary text-xs">
            <Plus size={15} /> Add Homepage Section
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((sec, idx) => (
            <div
              key={sec._id}
              className={`card p-4 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border transition-all ${
                !sec.isVisible ? 'opacity-60 bg-gray-50' : 'hover:border-primary-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 font-bold text-xs flex items-center justify-center font-mono">
                  #{idx + 1}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-navy-900 text-sm">
                      {sec.title || sectionTypeNames[sec.type] || sec.type}
                    </h4>
                    <span className="badge bg-primary-50 text-primary-700 text-[10px]">
                      {sectionTypeNames[sec.type] || sec.type}
                    </span>
                    {!sec.isVisible && (
                      <span className="badge bg-gray-200 text-gray-600 text-[10px]">
                        Hidden
                      </span>
                    )}
                  </div>
                  {sec.subtitle && <p className="text-xs text-gray-400 mt-0.5">{sec.subtitle}</p>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 text-gray-400 hover:text-navy-900 disabled:opacity-30 rounded-lg hover:bg-gray-100"
                  title="Move Up"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === sections.length - 1}
                  className="p-1.5 text-gray-400 hover:text-navy-900 disabled:opacity-30 rounded-lg hover:bg-gray-100"
                  title="Move Down"
                >
                  <ArrowDown size={16} />
                </button>

                <div className="h-4 w-px bg-gray-200 mx-1" />

                <button
                  onClick={() => handleToggleVisibility(sec)}
                  className={`p-1.5 rounded-lg ${
                    sec.isVisible
                      ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                      : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                  title={sec.isVisible ? 'Hide Section' : 'Show Section'}
                >
                  {sec.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>

                <button
                  onClick={() => openEditModal(sec)}
                  className="p-1.5 text-gray-400 hover:text-navy-900 rounded-lg hover:bg-gray-100"
                  title="Edit Section Details"
                >
                  <Edit size={16} />
                </button>

                <button
                  onClick={() => setDeleteId(sec._id)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  title="Delete Section"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Section Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-navy-900 text-base">
                {editingSection ? 'Edit Homepage Section' : 'Add New Homepage Section'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-navy-900 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Section Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  disabled={!!editingSection}
                  className="input"
                >
                  {Object.entries(sectionTypeNames).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Your Health, Our Priority"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Trusted Pharmacy Since 2015"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief narrative or promo message..."
                  className="input"
                />
              </div>

              <div>
                <label className="label">Banner Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://... or /uploads/..."
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">CTA Button Text</label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    placeholder="e.g. Shop Now"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">CTA Link URL</label>
                  <input
                    type="text"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    placeholder="e.g. /products"
                    className="input"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="text-xs font-semibold text-navy-800">Visible on Storefront</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Saving...' : editingSection ? 'Update Section' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Homepage Section"
        message="Are you sure you want to remove this section from the homepage?"
        danger={true}
      />
    </div>
  );
}
