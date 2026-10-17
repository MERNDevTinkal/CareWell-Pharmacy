import { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Trash2, ShieldCheck } from 'lucide-react';
import { reviewService } from '../services/reviewService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const fetchReviews = () => {
    setLoading(true);
    reviewService.getReviews({
      page,
      limit: 10,
      status: statusFilter || undefined
    })
      .then((res) => {
        setReviews(res.data?.data || []);
        if (res.data?.pagination) {
          setPages(res.data.pagination.pages);
        }
      })
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [page, statusFilter]);

  const handleApprove = async (id) => {
    try {
      await reviewService.approveReview(id);
      toast.success('Review approved and published');
      fetchReviews();
    } catch {
      toast.error('Failed to approve review');
    }
  };

  const handleReject = async (id) => {
    try {
      await reviewService.rejectReview(id);
      toast.success('Review rejected');
      fetchReviews();
    } catch {
      toast.error('Failed to reject review');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await reviewService.deleteReview(deleteId);
      toast.success('Review deleted');
      setDeleteId(null);
      fetchReviews();
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const columns = [
    {
      header: 'Product',
      render: (r) => (
        <div className="flex items-center gap-2 max-w-xs">
          <img
            src={r.product?.images?.[0]?.url || 'https://placehold.co/100x100?text=Product'}
            alt=""
            className="w-9 h-9 object-contain rounded-lg border border-gray-100 bg-gray-50 p-1 flex-shrink-0"
          />
          <p className="font-bold text-navy-900 text-xs truncate">{r.product?.name || 'Product'}</p>
        </div>
      )
    },
    {
      header: 'Customer',
      render: (r) => (
        <div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-navy-900 text-xs">{r.user?.name || 'Anonymous'}</span>
            {r.isVerifiedPurchase && (
              <span className="text-emerald-600" title="Verified Purchase">
                <ShieldCheck size={13} />
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-400">{r.user?.email || '—'}</p>
        </div>
      )
    },
    {
      header: 'Rating & Feedback',
      render: (r) => (
        <div className="max-w-md">
          <div className="flex items-center gap-1 mb-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={12}
                className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
              />
            ))}
            {r.title && <span className="font-bold text-xs text-navy-900 ml-1.5">{r.title}</span>}
          </div>
          <p className="text-xs text-gray-600 line-clamp-2">{r.comment}</p>
        </div>
      )
    },
    {
      header: 'Status',
      render: (r) => (
        <span className={`badge ${
          r.status === 'approved'
            ? 'bg-green-100 text-green-800'
            : r.status === 'rejected'
            ? 'bg-rose-100 text-rose-800'
            : 'bg-amber-100 text-amber-800'
        }`}>
          {r.status?.toUpperCase()}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          {r.status !== 'approved' && (
            <button
              onClick={() => handleApprove(r._id)}
              className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
              title="Approve Review"
            >
              <CheckCircle size={15} />
            </button>
          )}
          {r.status !== 'rejected' && (
            <button
              onClick={() => handleReject(r._id)}
              className="p-1.5 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50"
              title="Reject Review"
            >
              <XCircle size={15} />
            </button>
          )}
          <button
            onClick={() => setDeleteId(r._id)}
            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
            title="Delete Review"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Reviews & Ratings"
        subtitle="Moderate customer product ratings, verify verified purchase badges, and approve user comments"
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {[
          { label: 'All Reviews', value: '' },
          { label: 'Pending Moderation', value: 'pending' },
          { label: 'Approved', value: 'approved' },
          { label: 'Rejected', value: 'rejected' }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              statusFilter === tab.value
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-navy-900 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={reviews}
        loading={loading}
        emptyMessage="No reviews found."
      />

      <Pagination
        page={page}
        pages={pages}
        onPageChange={(p) => setPage(p)}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to permanently delete this customer review?"
        danger={true}
      />
    </div>
  );
}
