import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { cmsService } from '../services/cmsService';
import PageHeader from '../components/ui/PageHeader';
import toast from 'react-hot-toast';

export default function CMSPageEditorPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    type: 'custom',
    content: '',
    isPublished: true,
    seo: {
      title: '',
      description: '',
      keywords: ''
    }
  });

  useEffect(() => {
    if (isEdit) {
      cmsService.getPage(id)
        .then((res) => {
          const p = res.data?.data;
          if (p) {
            setFormData({
              title: p.title || '',
              slug: p.slug || '',
              type: p.type || 'custom',
              content: p.content || '',
              isPublished: p.isPublished ?? true,
              seo: {
                title: p.seo?.title || '',
                description: p.seo?.description || '',
                keywords: p.seo?.keywords || ''
              }
            });
          }
        })
        .catch(() => {
          toast.error('Failed to load page');
          navigate('/admin/cms-pages');
        })
        .finally(() => setFetching(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('seo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        seo: { ...prev.seo, [field]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Page title is required');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await cmsService.updatePage(id, formData);
        toast.success('Page updated successfully');
      } else {
        await cmsService.createPage(formData);
        toast.success('Page created successfully');
      }
      navigate('/admin/cms-pages');
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/cms-pages"
            className="p-2 text-gray-400 hover:text-navy-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <PageHeader
            title={isEdit ? `Edit: ${formData.title}` : 'Create CMS Page'}
            subtitle="Author dynamic policy content, legal disclaimers, or institutional information"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 bg-white space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="label">Page Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Return & Refund Policy"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Page Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input"
              >
                <option value="about">About Us</option>
                <option value="privacy">Privacy Policy</option>
                <option value="terms">Terms & Conditions</option>
                <option value="shipping">Shipping Policy</option>
                <option value="returns">Return & Refund</option>
                <option value="prescription_policy">Prescription Policy</option>
                <option value="disclaimer">Disclaimer</option>
                <option value="custom">Custom Content</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">URL Slug (e.g. /pages/slug-here)</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="auto-generated from title if blank"
              className="input font-mono text-xs"
            />
          </div>

          <div>
            <label className="label">HTML Page Content *</label>
            <textarea
              name="content"
              rows={14}
              value={formData.content}
              onChange={handleChange}
              placeholder="Write page content in HTML or plain text (e.g. <h2>1. General Terms</h2><p>...</p>)"
              required
              className="input font-mono text-xs leading-relaxed"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <span className="text-xs font-semibold text-navy-800">Published (Visible to public)</span>
          </label>
        </div>

        {/* SEO Meta */}
        <div className="card p-6 bg-white space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">
            Search Engine Optimization (SEO)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Meta Title</label>
              <input
                type="text"
                name="seo.title"
                value={formData.seo.title}
                onChange={handleChange}
                placeholder="Page Title - CareWell Pharmacy"
                className="input"
              />
            </div>

            <div>
              <label className="label">Meta Keywords</label>
              <input
                type="text"
                name="seo.keywords"
                value={formData.seo.keywords}
                onChange={handleChange}
                placeholder="pharmacy, returns, policy, refund"
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Meta Description</label>
            <textarea
              rows={2}
              name="seo.description"
              value={formData.seo.description}
              onChange={handleChange}
              placeholder="Brief description for search engine result snippet..."
              className="input"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Link to="/admin/cms-pages" className="btn-ghost">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            <Save size={16} />
            {loading ? 'Saving...' : isEdit ? 'Update Page' : 'Create Page'}
          </button>
        </div>
      </form>
    </div>
  );
}
