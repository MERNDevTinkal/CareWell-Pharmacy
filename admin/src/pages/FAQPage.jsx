import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import { cmsService } from '../services/cmsService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    order: 0,
    isPublished: true
  });

  const fetchFaqs = () => {
    setLoading(true);
    cmsService.getFAQs()
      .then((res) => setFaqs(res.data?.data || []))
      .catch(() => toast.error('Failed to load FAQs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openCreateModal = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: 'Ordering',
      order: faqs.length + 1,
      isPublished: true
    });
    setModalOpen(true);
  };

  const openEditModal = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || 'General',
      order: faq.order ?? 0,
      isPublished: faq.isPublished ?? true
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) {
      toast.error('Question and Answer are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        order: parseInt(formData.order, 10) || 0
      };

      if (editingFaq) {
        await cmsService.updateFAQ(editingFaq._id, payload);
        toast.success('FAQ updated successfully');
      } else {
        await cmsService.createFAQ(payload);
        toast.success('FAQ created successfully');
      }
      setModalOpen(false);
      fetchFaqs();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await cmsService.deleteFAQ(deleteId);
      toast.success('FAQ deleted');
      setDeleteId(null);
      fetchFaqs();
    } catch {
      toast.error('Failed to delete FAQ');
    }
  };

  const columns = [
    {
      header: 'Question',
      render: (f) => (
        <div className="max-w-md">
          <p className="font-bold text-navy-900 text-xs">{f.question}</p>
          <p className="text-gray-500 text-xs line-clamp-2 mt-0.5">{f.answer}</p>
        </div>
      )
    },
    {
      header: 'Category',
      render: (f) => (
        <span className="badge bg-primary-50 text-primary-700 text-[10px] font-bold">
          {f.category}
        </span>
      )
    },
    {
      header: 'Order',
      render: (f) => <span className="text-xs text-gray-400 font-mono">#{f.order ?? 0}</span>
    },
    {
      header: 'Status',
      render: (f) => (
        <span className={`badge ${f.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
          {f.isPublished ? 'Published' : 'Hidden'}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (f) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openEditModal(f)}
            className="p-1.5 text-gray-400 hover:text-navy-900 rounded-lg hover:bg-gray-100"
            title="Edit FAQ"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => setDeleteId(f._id)}
            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
            title="Delete FAQ"
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
        title="Frequently Asked Questions (FAQs)"
        subtitle="Manage pharmacy help center questions, categorised answers, and store policies"
        actions={
          <button onClick={openCreateModal} className="btn-primary text-xs">
            <Plus size={15} /> Add FAQ
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={faqs}
        loading={loading}
        emptyMessage="No FAQs found."
      />

      {/* Add / Edit FAQ Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-navy-900 text-base">
                {editingFaq ? 'Edit FAQ' : 'Add FAQ'}
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
                <label className="label">Question *</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. How do I upload my doctor prescription?"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="label">Answer *</label>
                <textarea
                  rows={4}
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Comprehensive answer for the customer..."
                  required
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                  >
                    <option value="Ordering">Ordering</option>
                    <option value="Shipping">Shipping & Delivery</option>
                    <option value="Returns">Returns & Refunds</option>
                    <option value="Prescriptions">Prescriptions</option>
                    <option value="Payments">Payments & Billing</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="label">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="text-xs font-semibold text-navy-800">Published on Website</span>
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
                  {submitting ? 'Saving...' : editingFaq ? 'Update FAQ' : 'Save FAQ'}
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
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ question?"
        danger={true}
      />
    </div>
  );
}
