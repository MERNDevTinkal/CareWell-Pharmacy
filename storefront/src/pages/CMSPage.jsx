import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { cmsService } from '../services/cmsService';
import Breadcrumb from '../components/ui/Breadcrumb';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function CMSPage({ slug: propSlug }) {
  const { slug: paramSlug } = useParams();
  const slug = propSlug || paramSlug;

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    cmsService.getPage(slug)
      .then(res => setPage(res.data?.data))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading content..." />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-navy-900 mb-2">Page Not Found</h1>
        <p className="text-xs text-gray-500">The requested content page is not available or has been unpublished.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Breadcrumb items={[{ label: page.title }]} />
      <div className="card p-8 bg-white space-y-6 shadow-sm">
        <h1 className="text-3xl font-black text-navy-900 pb-4 border-b border-gray-100">
          {page.title}
        </h1>
        <div
          className="prose prose-emerald max-w-none text-navy-800 text-sm leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: page.content || '' }}
        />
        <div className="pt-6 border-t border-gray-100 text-[11px] text-gray-400">
          Last updated: {new Date(page.updatedAt || page.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

