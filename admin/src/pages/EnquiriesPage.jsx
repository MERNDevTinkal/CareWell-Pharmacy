import { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, CheckCircle, Clock } from 'lucide-react';
import { enquiryService } from '../services/enquiryService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import toast from 'react-hot-toast';

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // View Modal
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEnquiries = () => {
    setLoading(true);
    enquiryService.getEnquiries({
      page,
      limit: 10,
      status: statusFilter || undefined
    })
      .then((res) => {
        setEnquiries(res.data?.data || []);
        if (res.data?.pagination) {
          setPages(res.data.pagination.pages);
        }
      })
      .catch(() => toast.error('Failed to load enquiries'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEnquiries();
  }, [page, statusFilter]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    setSubmitting(true);
    try {
      await enquiryService.updateStatus(selectedEnquiry._id, {
        status: newStatus,
        adminNotes
      });
      toast.success('Inquiry updated successfully');
      setSelectedEnquiry(null);
      fetchEnquiries();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Sender',
      render: (e) => (
        <div>
          <p className="font-bold text-navy-900 text-xs">{e.name}</p>
          <p className="text-[11px] text-gray-400">{e.email}</p>
          {e.phone && <p className="text-[10px] text-gray-400 font-mono">{e.phone}</p>}
        </div>
      )
    },
    {
      header: 'Subject & Message',
      render: (e) => (
        <div className="max-w-md">
          <p className="font-semibold text-navy-900 text-xs">{e.subject || 'Inquiry'}</p>
          <p className="text-gray-500 text-xs line-clamp-2">{e.message}</p>
        </div>
      )
    },
    {
      header: 'Date',
      render: (e) => (
        <span className="text-xs text-gray-400">
          {new Date(e.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Status',
      render: (e) => (
        <span className={`badge ${
          e.status === 'resolved'
            ? 'bg-green-100 text-green-800'
            : e.status === 'replied'
            ? 'bg-blue-100 text-blue-800'
            : e.status === 'read'
            ? 'bg-gray-100 text-gray-700'
            : 'bg-amber-100 text-amber-800'
        }`}>
          {e.status?.toUpperCase()}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (e) => (
        <button
          onClick={() => {
            setSelectedEnquiry(e);
            setNewStatus(e.status);
            setAdminNotes(e.adminNotes || '');
          }}
          className="btn-primary text-xs px-3 py-1.5"
        >
          View / Reply
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Inquiries & Messages"
        subtitle="Manage contact form submissions, customer support messages, and consultation requests"
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {[
          { label: 'All Inquiries', value: '' },
          { label: 'New / Unread', value: 'new' },
          { label: 'Read', value: 'read' },
          { label: 'Replied', value: 'replied' },
          { label: 'Resolved', value: 'resolved' }
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
        data={enquiries}
        loading={loading}
        emptyMessage="No customer inquiries found."
      />

      <Pagination
        page={page}
        pages={pages}
        onPageChange={(p) => setPage(p)}
      />

      {/* Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-navy-900 text-base">{selectedEnquiry.subject || 'Customer Inquiry'}</h3>
                <p className="text-xs text-gray-400">From {selectedEnquiry.name} ({selectedEnquiry.email})</p>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-gray-400 hover:text-navy-900 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-xs">
              <p className="text-navy-900 whitespace-pre-wrap">{selectedEnquiry.message}</p>
              {selectedEnquiry.phone && (
                <p className="text-gray-400 pt-2 border-t border-gray-200">Phone: {selectedEnquiry.phone}</p>
              )}
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="label">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input"
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="label">Staff Notes / Action Taken</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Called customer and answered query regarding medicine dosage..."
                  className="input"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="btn-ghost"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Saving...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
