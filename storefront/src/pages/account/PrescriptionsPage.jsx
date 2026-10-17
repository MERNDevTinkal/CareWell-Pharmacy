import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/prescriptions/my')
      .then(res => setPrescriptions(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="badge bg-green-100 text-green-800 flex items-center gap-1 font-bold">
            <CheckCircle size={12} /> Approved by Pharmacist
          </span>
        );
      case 'rejected':
        return (
          <span className="badge bg-red-100 text-red-800 flex items-center gap-1 font-bold">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="badge bg-amber-100 text-amber-800 flex items-center gap-1 font-bold">
            <Clock size={12} /> Pharmacist Review Pending
          </span>
        );
    }
  };

  return (
    <div className="card p-6 bg-white space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-navy-900">My Prescriptions</h1>
          <p className="text-xs text-gray-500">Track verification status of your uploaded medical documents</p>
        </div>
        <Link to="/upload-prescription" className="btn-primary text-xs px-4 py-2">
          <Upload size={14} /> Upload New
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner size="md" text="Loading prescription history..." />
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-12 text-gray-400 space-y-3">
          <FileText size={40} className="mx-auto text-gray-300" />
          <p className="text-xs">No prescriptions uploaded yet.</p>
          <Link to="/upload-prescription" className="btn-primary text-xs inline-flex mt-2">
            Upload Prescription
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((pres) => (
            <div
              key={pres._id}
              className="p-5 rounded-2xl border border-gray-200 hover:border-primary-200 transition-colors space-y-3 bg-white"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs pb-2 border-b border-gray-100">
                <span className="text-gray-400">
                  Uploaded on {new Date(pres.createdAt).toLocaleDateString()}
                </span>
                {getStatusBadge(pres.status)}
              </div>

              {/* Files */}
              <div className="flex flex-wrap gap-2">
                {pres.files?.map((f, i) => (
                  <a
                    key={i}
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl text-xs font-semibold text-primary-700 border border-gray-200 hover:bg-primary-50"
                  >
                    <FileText size={14} />
                    <span className="truncate max-w-[200px]">{f.filename || `Prescription ${i + 1}`}</span>
                  </a>
                ))}
              </div>

              {pres.reviewNote && (
                <div className="p-3 bg-gray-50 rounded-xl text-xs text-navy-800">
                  <strong>Review Notes:</strong> {pres.reviewNote}
                </div>
              )}

              {pres.status === 'rejected' && pres.rejectionReason && (
                <div className="p-3 bg-red-50 rounded-xl text-xs text-red-800">
                  <strong>Rejection Reason:</strong> {pres.rejectionReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
