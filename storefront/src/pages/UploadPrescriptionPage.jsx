import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, FileText, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Breadcrumb from '../components/ui/Breadcrumb';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function UploadPrescriptionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to upload your prescription');
      navigate('/login');
      return;
    }
    if (files.length === 0) {
      toast.error('Please select a prescription document to upload');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));

      await api.post('/prescriptions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(true);
      toast.success('Prescription uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Prescription upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumb items={[{ label: 'Upload Prescription' }]} />

      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-black text-navy-900">Upload Doctor's Prescription</h1>
        <p className="text-sm text-gray-500">
          Upload a clear photo or PDF of your doctor's prescription. Our certified pharmacists will review and dispense your medications accurately.
        </p>
      </div>

      {success ? (
        <div className="card p-8 text-center space-y-4 max-w-lg mx-auto bg-green-50/50 border-green-200">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-navy-900">Prescription Received!</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Our licensed pharmacist is reviewing your prescription. You can view the status of your prescription in your account dashboard.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link to="/account/prescriptions" className="btn-primary text-xs">
              View My Prescriptions
            </Link>
            <button onClick={() => { setSuccess(false); setFiles([]); }} className="btn-outline text-xs">
              Upload Another
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Upload Form */}
          <div className="md:col-span-7 card p-6">
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="border-2 border-dashed border-gray-200 hover:border-primary-500 rounded-3xl p-8 text-center cursor-pointer transition-colors bg-gray-50/50">
                <input
                  type="file"
                  id="prescription-file"
                  onChange={handleFileChange}
                  multiple
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  className="hidden"
                />
                <label htmlFor="prescription-file" className="cursor-pointer space-y-3 block">
                  <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center mx-auto">
                    <Upload size={24} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-navy-900 block">
                      Click to choose files or drag & drop
                    </span>
                    <span className="text-xs text-gray-400 mt-1 block">
                      Supports JPG, PNG, and PDF up to 5MB
                    </span>
                  </div>
                </label>
              </div>

              {/* Selected Files List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-navy-900">Selected Documents ({files.length}):</p>
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl text-xs text-navy-800 border border-gray-100">
                      <FileText size={16} className="text-primary-600" />
                      <span className="truncate flex-1 font-medium">{f.name}</span>
                      <span className="text-gray-400 font-mono">{(f.size / 1024).toFixed(0)} KB</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || files.length === 0}
                className="btn-primary w-full justify-center text-sm py-3.5 shadow-lg shadow-primary-500/25 disabled:opacity-50"
              >
                {uploading ? 'Uploading Prescription...' : 'Submit for Pharmacist Review'}
              </button>
            </form>
          </div>

          {/* Guidelines */}
          <div className="md:col-span-5 space-y-4">
            <div className="card p-6 space-y-4 bg-gray-50 border-gray-200">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary-600" /> Valid Prescription Checklist
              </h3>
              <ul className="text-xs text-gray-600 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>Doctor's name, degree, and clinic letterhead</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>Patient's name, age, and consultation date</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>Medicine name, dosage strength and duration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>Doctor's signature and medical registration stamp</span>
                </li>
              </ul>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <span>Prescriptions older than 6 months or lacking doctor registration cannot be approved per CDSCO government norms.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

