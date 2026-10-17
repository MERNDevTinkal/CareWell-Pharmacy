import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, FileX, Eye, ShieldAlert, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { prescriptionService } from '../services/prescriptionService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import toast from 'react-hot-toast';

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Review modal state
  const [selectedRx, setSelectedRx] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPrescriptions = () => {
    setLoading(true);
    prescriptionService.getPrescriptions({
      page,
      limit: 10,
      status: statusFilter || undefined
    })
      .then((res) => {
        setPrescriptions(res.data?.data || []);
        if (res.data?.pagination) {
          setPages(res.data.pagination.pages);
        }
      })
      .catch(() => toast.error('Failed to load prescriptions'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [page, statusFilter]);

  const handleReview = async (status) => {
    if (!selectedRx) return;
    if (status === 'rejected' && !rejectionReason.trim()) {
      toast.error('Please enter a rejection reason for the customer');
      return;
    }

    setSubmitting(true);
    try {
      await prescriptionService.reviewPrescription(selectedRx._id, {
        status,
        reviewNote,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined
      });
      toast.success(`Prescription marked as ${status}`);
      setSelectedRx(null);
      setReviewNote('');
      setRejectionReason('');
      fetchPrescriptions();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Customer',
      render: (rx) => (
        <div>
          <p className="font-bold text-navy-900 text-xs">{rx.user?.name || 'Customer'}</p>
          <p className="text-[11px] text-gray-400">{rx.user?.email || '—'}</p>
          {rx.user?.phone && <p className="text-[10px] text-gray-400">{rx.user?.phone}</p>}
        </div>
      )
    },
    {
      header: 'Order Reference',
      render: (rx) => (
        rx.order ? (
          <div>
            <Link
              to={`/admin/orders/${rx.order._id}`}
              className="font-bold text-primary-600 hover:underline font-mono text-xs"
            >
              {rx.order.orderNumber}
            </Link>
            <p className="text-[10px] text-gray-400">₹{rx.order.totalAmount}</p>
          </div>
        ) : (
          <span className="text-gray-400 text-xs">Direct Upload</span>
        )
      )
    },
    {
      header: 'Prescription Files',
      render: (rx) => (
        <div className="flex items-center gap-2">
          {rx.files?.map((f, i) => (
            <a
              key={i}
              href={f.url}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity"
              title={f.filename || 'View File'}
            >
              {f.mimetype?.includes('image') || f.url?.match(/\.(jpg|jpeg|png|webp)/i) ? (
                <img src={f.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <FileCheck size={16} className="text-primary-600" />
              )}
            </a>
          ))}
          {(!rx.files || rx.files.length === 0) && (
            <span className="text-gray-400 text-xs italic">No document</span>
          )}
        </div>
      )
    },
    {
      header: 'Date Uploaded',
      render: (rx) => (
        <span className="text-xs text-gray-500">
          {new Date(rx.createdAt).toLocaleDateString()} {new Date(rx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )
    },
    {
      header: 'Status',
      render: (rx) => (
        <span className={`badge ${
          rx.status === 'approved'
            ? 'bg-green-100 text-green-800'
            : rx.status === 'rejected'
            ? 'bg-rose-100 text-rose-800'
            : 'bg-amber-100 text-amber-800'
        }`}>
          {rx.status?.toUpperCase()}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (rx) => (
        <button
          onClick={() => {
            setSelectedRx(rx);
            setReviewNote(rx.reviewNote || '');
            setRejectionReason(rx.rejectionReason || '');
          }}
          className="btn-primary text-xs px-3 py-1.5"
        >
          <Eye size={13} /> Review Rx
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prescriptions Review Queue"
        subtitle="Registered Pharmacist portal for verifying customer uploaded prescriptions and approving Rx medicines"
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {[
          { label: 'Pending Review', value: 'pending' },
          { label: 'Approved', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'All Prescriptions', value: '' }
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
        data={prescriptions}
        loading={loading}
        emptyMessage="No prescriptions waiting in this queue."
      />

      <Pagination
        page={page}
        pages={pages}
        onPageChange={(p) => setPage(p)}
      />

      {/* Pharmacist Review Modal */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-navy-900 text-base flex items-center gap-2">
                  <FileCheck size={18} className="text-primary-500" /> Pharmacist Prescription Review
                </h3>
                <p className="text-xs text-gray-400">
                  Customer: {selectedRx.user?.name} ({selectedRx.user?.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedRx(null)}
                className="text-gray-400 hover:text-navy-900 text-xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            {/* Document Viewer */}
            <div className="space-y-2">
              <label className="label">Prescription Document(s)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedRx.files?.map((f, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-2 bg-gray-50 flex flex-col items-center">
                    <img
                      src={f.url}
                      alt="Prescription"
                      className="max-h-64 object-contain rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/400x300?text=Prescription+Document';
                      }}
                    />
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary-600 font-bold mt-2 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink size={12} /> Open Full Size Document
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Association */}
            {selectedRx.order && (
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs space-y-1">
                <span className="font-bold text-navy-900">Linked Order:</span>{' '}
                <span className="font-mono">{selectedRx.order.orderNumber}</span> (₹{selectedRx.order.totalAmount})
                <p className="text-gray-500">
                  Approving will automatically mark the order as <strong>Confirmed</strong> for packing and dispatch.
                </p>
              </div>
            )}

            {/* Notes Form */}
            <div className="space-y-3">
              <div>
                <label className="label">Pharmacist Verification Note (Optional)</label>
                <input
                  type="text"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="e.g. Verified doctor registration & dosage validity"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="label">Rejection Reason (Required if rejecting)</label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Prescription expired / doctor seal illegible / dosage mismatch"
                  className="input text-xs"
                />
              </div>
            </div>

            {/* Review Decision Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedRx(null)}
                className="btn-ghost"
              >
                Close
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleReview('rejected')}
                className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <FileX size={14} /> Reject Prescription
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleReview('approved')}
                className="btn-primary text-xs px-4 py-2"
              >
                <CheckCircle size={14} /> Approve Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
