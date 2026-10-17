import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, BookOpen, ExternalLink } from 'lucide-react';
import { cmsService } from '../services/cmsService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const fetchBlogs = () => {
    setLoading(true);
    cmsService.getBlogs()
      .then((res) => setBlogs(res.data?.data || []))
      .catch(() => toast.error('Failed to load blog posts'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await cmsService.deleteBlog(deleteId);
      toast.success('Article removed successfully');
      setDeleteId(null);
      fetchBlogs();
    } catch {
      toast.error('Failed to delete blog post');
    }
  };

  const columns = [
    {
      header: 'Article',
      render: (b) => (
        <div className="flex items-center gap-3 max-w-sm">
          <img
            src={b.coverImage || 'https://placehold.co/120x80?text=Health+Blog'}
            alt=""
            className="w-12 h-9 object-cover rounded-lg border border-gray-100 flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="font-bold text-navy-900 text-xs truncate">{b.title}</p>
            <p className="text-[11px] text-gray-400 font-mono truncate">/blog/{b.slug}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      render: (b) => (
        <span className="badge bg-primary-50 text-primary-700 font-bold text-[10px]">
          {b.category || 'Health'}
        </span>
      )
    },
    {
      header: 'Author',
      render: (b) => <span className="text-xs text-gray-600">{b.author?.name || 'CareWell Health Team'}</span>
    },
    {
      header: 'Read Time',
      render: (b) => <span className="text-xs text-gray-400">{b.readTime || 5} min read</span>
    },
    {
      header: 'Status',
      render: (b) => (
        <span className={`badge ${b.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
          {b.isPublished ? 'Published' : 'Draft'}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (b) => (
        <div className="flex items-center justify-end gap-2">
          <a
            href={`http://localhost:5173/blog/${b.slug}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 text-gray-400 hover:text-navy-900 rounded-lg hover:bg-gray-100"
            title="Preview Article"
          >
            <ExternalLink size={14} />
          </a>
          <Link
            to={`/admin/blogs/edit/${b._id}`}
            className="p-1.5 text-gray-400 hover:text-navy-900 rounded-lg hover:bg-gray-100"
            title="Edit Article"
          >
            <Edit size={14} />
          </Link>
          <button
            onClick={() => setDeleteId(b._id)}
            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
            title="Delete Article"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Health & Wellness Blog"
        subtitle="Publish health awareness articles, vitamin guides, and pharmacy news"
        actions={
          <Link to="/admin/blogs/new" className="btn-primary text-xs">
            <Plus size={15} /> Write New Article
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={blogs}
        loading={loading}
        emptyMessage="No articles found."
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        message="Are you sure you want to delete this blog article?"
        danger={true}
      />
    </div>
  );
}
