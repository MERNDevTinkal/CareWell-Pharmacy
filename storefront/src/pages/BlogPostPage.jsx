import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, User, ArrowLeft, Share2 } from 'lucide-react';
import { cmsService } from '../services/cmsService';
import Breadcrumb from '../components/ui/Breadcrumb';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function BlogPostPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    cmsService.getBlog(slug)
      .then(res => setBlog(res.data?.data))
      .catch(() => setBlog(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading article..." />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-navy-900 mb-2">Article Not Found</h1>
        <p className="text-xs text-gray-500 mb-6">The article you requested could not be found.</p>
        <Link to="/blog" className="btn-primary text-xs">Back to Blog</Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumb
        items={[
          { label: 'Blog', url: '/blog' },
          { label: blog.title }
        ]}
      />

      <div className="space-y-4">
        <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
          {blog.category || 'Health & Wellness'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-navy-900 leading-tight">
          {blog.title}
        </h1>
        <div className="flex items-center gap-4 text-xs text-gray-500 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <User size={14} className="text-gray-400" />
            <span className="font-semibold text-navy-800">{blog.author?.name || 'CareWell Team'}</span>
          </div>
          <span>•</span>
          <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock size={14} /> {blog.readTime || 4} min read
          </span>
        </div>
      </div>

      {blog.coverImage && (
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="w-full h-80 object-cover rounded-3xl shadow-md"
        />
      )}

      <div className="card p-8 bg-white shadow-sm">
        <div
          className="prose prose-emerald max-w-none text-navy-800 text-sm leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: blog.content || '' }}
        />
      </div>

      <div className="flex justify-between items-center pt-4">
        <Link to="/blog" className="btn-outline text-xs px-4 py-2 inline-flex items-center gap-1.5">
          <ArrowLeft size={14} /> Back to All Articles
        </Link>
      </div>
    </article>
  );
}

