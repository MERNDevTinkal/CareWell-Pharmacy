import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, User } from 'lucide-react';
import { cmsService } from '../services/cmsService';
import Breadcrumb from '../components/ui/Breadcrumb';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchBlogs = (page = 1) => {
    setLoading(true);
    cmsService.getBlogs({ page, limit: 6 })
      .then(res => {
        setBlogs(res.data?.data || []);
        if (res.data?.pagination) setPagination(res.data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBlogs(1);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumb items={[{ label: 'Health Articles' }]} />

      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-black text-navy-900">CareWell Health & Wellness Blog</h1>
        <p className="text-sm text-gray-500">
          Medical advice, nutritional tips, and healthcare guides written and verified by pharmacists.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" text="Loading articles..." />
      ) : blogs.length === 0 ? (
        <p className="text-center text-xs text-gray-400 py-12">No health articles published yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((b) => (
              <article
                key={b._id}
                className="card flex flex-col justify-between hover:shadow-xl hover:border-primary-100 transition-all overflow-hidden"
              >
                <div>
                  <img
                    src={b.coverImage || 'https://placehold.co/600x350?text=Health+Article'}
                    alt={b.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6 space-y-2.5">
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 font-semibold">
                      <span className="text-primary-600 font-bold uppercase">{b.category || 'Health'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {b.readTime || 4} min read
                      </span>
                    </div>
                    <Link to={`/blog/${b.slug}`}>
                      <h2 className="text-base font-bold text-navy-900 hover:text-primary-600 transition-colors line-clamp-2">
                        {b.title}
                      </h2>
                    </Link>
                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                      {b.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between border-t border-gray-50 mt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User size={14} className="text-gray-400" />
                    <span>{b.author?.name || 'CareWell Team'}</span>
                  </div>
                  <Link
                    to={`/blog/${b.slug}`}
                    className="text-xs font-bold text-primary-600 hover:underline inline-flex items-center gap-1"
                  >
                    Read Article <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={fetchBlogs}
          />
        </>
      )}
    </div>
  );
}

