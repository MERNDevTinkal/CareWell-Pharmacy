import { useState, useEffect } from 'react';
import { Upload, Copy, Trash2, Image, Check, Search, Folder } from 'lucide-react';
import { mediaService } from '../services/mediaService';
import PageHeader from '../components/ui/PageHeader';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export default function MediaLibraryPage() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchMedia = () => {
    setLoading(true);
    mediaService.getMedia({ page, limit: 18, search: search || undefined })
      .then((res) => {
        setMedia(res.data?.data || []);
        if (res.data?.pagination) {
          setPages(res.data.pagination.pages);
        }
      })
      .catch(() => toast.error('Failed to load media files'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMedia();
  }, [page]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt', file.name);

    setUploading(true);
    try {
      await mediaService.uploadMedia(formData);
      toast.success('Image uploaded successfully');
      fetchMedia();
    } catch (err) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await mediaService.deleteMedia(deleteId);
      toast.success('Media deleted');
      setDeleteId(null);
      fetchMedia();
    } catch {
      toast.error('Failed to delete media');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Media Library & Assets"
          subtitle="Upload and manage product imagery, homepage banners, and promotional assets"
        />

        <label className="btn-primary text-xs cursor-pointer inline-flex items-center gap-2">
          <Upload size={15} />
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : media.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((item) => (
            <div
              key={item._id}
              className="card p-2 bg-white group hover:shadow-md transition-all border border-gray-100 flex flex-col justify-between"
            >
              <div className="w-full aspect-square rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-100 mb-2 relative">
                <img
                  src={item.url}
                  alt={item.alt || ''}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/150x150?text=Asset';
                  }}
                />
              </div>

              <div className="space-y-1">
                <p className="font-bold text-navy-900 text-[11px] truncate" title={item.originalName || item.filename}>
                  {item.originalName || item.filename}
                </p>
                <p className="text-[10px] text-gray-400">
                  {item.size ? `${Math.round(item.size / 1024)} KB` : 'Uploaded'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                <button
                  onClick={() => copyToClipboard(item.url, item._id)}
                  className="text-[10px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  title="Copy Image URL"
                >
                  {copiedId === item._id ? <Check size={12} /> : <Copy size={12} />}
                  {copiedId === item._id ? 'Copied' : 'Copy URL'}
                </button>

                <button
                  onClick={() => setDeleteId(item._id)}
                  className="p-1 text-gray-400 hover:text-rose-600 rounded"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center bg-white space-y-3">
          <Image size={36} className="text-gray-300 mx-auto" />
          <h3 className="font-bold text-navy-900 text-sm">No uploaded media yet</h3>
          <p className="text-xs text-gray-400">Upload your brand logos, banners, and product photos to reference them across the store.</p>
        </div>
      )}

      <Pagination
        page={page}
        pages={pages}
        onPageChange={(p) => setPage(p)}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Media File"
        message="Are you sure you want to delete this media file from disk?"
        danger={true}
      />
    </div>
  );
}
