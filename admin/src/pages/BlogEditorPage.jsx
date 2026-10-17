import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { cmsService } from '../services/cmsService';
import PageHeader from '../components/ui/PageHeader';
import toast from 'react-hot-toast';

export default function BlogEditorPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Health & Wellness',
    readTime: 5,
    coverImage: '',
    excerpt: '',
    content: '',
    tags: '',
    authorName: 'CareWell Health Team',
    isPublished: true,
    seo: {
      title: '',
      description: '',
      keywords: ''
    }
  });

  useEffect(() => {
    if (isEdit) {
      cmsService.getBlogs()
        .then((res) => {
          const list = res.data?.data || [];
          const b = list.find((item) => item._id === id);
          if (b) {
            setFormData({
              title: b.title || '',
              slug: b.slug || '',
              category: b.category || 'Health & Wellness',
              readTime: b.readTime || 5,
              coverImage: b.coverImage || '',
              excerpt: b.excerpt || '',
              content: b.content || '',
              tags: Array.isArray(b.tags) ? b.tags.join(', ') : '',
              authorName: b.author?.name || 'CareWell Health Team',
              isPublished: b.isPublished ?? true,
              seo: {
                title: b.seo?.title || '',
                description: b.seo?.description || '',
                keywords: b.seo?.keywords || ''
              }
            });
          } else {
            toast.error('Article not found');
            navigate('/admin/blogs');
          }
        })
        .catch(() => {
          toast.error('Failed to load article');
          navigate('/admin/blogs');
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
    if (!formData.title || !formData.content) {
      toast.error('Title and Content are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        slug: formData.slug || undefined,
        category: formData.category,
        readTime: parseInt(formData.readTime, 10) || 5,
        coverImage: formData.coverImage || `https://placehold.co/800x450?text=${encodeURIComponent(formData.title)}`,
        excerpt: formData.excerpt,
        content: formData.content,
        author: { name: formData.authorName },
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        isPublished: formData.isPublished,
        seo: formData.seo
      };

      if (isEdit) {
        await cmsService.updateBlog(id, payload);
        toast.success('Article updated successfully');
      } else {
        await cmsService.createBlog(payload);
        toast.success('Article created successfully');
      }
      navigate('/admin/blogs');
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
            to="/admin/blogs"
            className="p-2 text-gray-400 hover:text-navy-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <PageHeader
            title={isEdit ? `Edit: ${formData.title}` : 'Write Health Article'}
            subtitle="Author informative medical and healthcare guidance for your customers"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 bg-white space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="label">Article Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. 5 Essential Vitamins for Natural Immunity"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Vitamins, Health Tips"
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Slug (Optional)</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="auto-generated from title"
                className="input font-mono text-xs"
              />
            </div>

            <div>
              <label className="label">Author Name</label>
              <input
                type="text"
                name="authorName"
                value={formData.authorName}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="label">Read Time (minutes)</label>
              <input
                type="number"
                name="readTime"
                min="1"
                value={formData.readTime}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Cover Image URL</label>
            <input
              type="text"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="https://... or placeholder URL"
              className="input"
            />
          </div>

          <div>
            <label className="label">Short Excerpt (Summary)</label>
            <textarea
              rows={2}
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Brief summary displayed on blog catalog cards..."
              className="input"
            />
          </div>

          <div>
            <label className="label">Full Content (HTML or Markdown text) *</label>
            <textarea
              rows={12}
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write full health advice and content..."
              required
              className="input font-mono text-xs leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="label">Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="vitamins, immunity, health"
                className="input"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="text-xs font-semibold text-navy-800">Publish Article Immediately</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Link to="/admin/blogs" className="btn-ghost">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            <Save size={16} />
            {loading ? 'Saving...' : isEdit ? 'Update Article' : 'Publish Article'}
          </button>
        </div>
      </form>
    </div>
  );
}
