import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, FileText, CheckCircle, ExternalLink } from 'lucide-react';
import { cmsService } from '../services/cmsService';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export default function CMSPagesPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const fetchPages = () => {
    setLoading(true);
    cmsService.getPages()
      .then((res) => setPages(res.data?.data || []))
      .catch(() => toast.error('Failed to load CMS pages'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await cmsService.deletePage(deleteId);
      toast.success('Page deleted successfully');
      setDeleteId(null);
      fetchPages();
    } catch {
      toast.error('Failed to delete page');
    }
  };

  const columns = [
    {
      header: 'Page Title',
      render: (p) => (
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-primary-500 flex-shrink-0" />
          <div>
            <p className="font-bold text-navy-900 text-xs">{p.title}</p>
            <p className="text-[11px] text-gray-400 font-mono">/pages/{p.slug}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Page Type',
      render: (p) => (
        <span className="badge bg-gray-100 text-gray-700 uppercase font-mono text-[10px]">
          {p.type || 'custom'}
        </span>
      )
    },
    {
      header: 'Status',
      render: (p) => (
        <span className={`badge ${p.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
          {p.isPublished ? 'Published' : 'Draft'}
        </span>
      )
    },
    {
      header: 'Last Updated',
      render: (p) => (
        <span className="text-xs text-gray-400">
          {new Date(p.updatedAt || p.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <a
            href={`http://localhost:5173/pages/${p.slug}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 text-gray-400 hover:text-navy-900 rounded-lg hover:bg-gray-100"
            title="Preview on Storefront"
          >
            <ExternalLink size={14} />
          </a>
          <Link
            to={`/admin/cms-pages/edit/${p._id}`}
            className="p-1.5 text-gray-400 hover:text-navy-900 rounded-lg hover:bg-gray-100"
            title="Edit Content"
          >
            <Edit size={14} />
          </Link>
          <button
            onClick={() => setDeleteId(p._id)}
            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
            title="Delete Page"
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
        title="CMS Policy Pages"
        subtitle="Manage dynamic healthcare compliance policies, privacy terms, return rules, and custom content"
        actions={
          <Link to="/admin/cms-pages/new" className="btn-primary text-xs">
            <Plus size={15} /> Add New CMS Page
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={pages}
        loading={loading}
        emptyMessage="No CMS pages found."
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete CMS Page"
        message="Are you sure you want to delete this page? Any navigation links to this slug will break."
        danger={true}
      />
    </div>
  );
}
