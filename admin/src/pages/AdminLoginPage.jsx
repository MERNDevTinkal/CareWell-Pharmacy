import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Admin authentication verified!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.message || 'Invalid administrator credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const fillSuperAdmin = () => {
    setEmail('admin@carewell.com');
    setPassword('Admin@123');
  };

  const fillOrderManager = () => {
    setEmail('orders@carewell.com');
    setPassword('Admin@123');
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8 bg-white shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary-500/30">
            C
          </div>
          <h1 className="text-2xl font-black text-navy-900">CareWell Administration</h1>
          <p className="text-xs text-gray-500">Sign in to manage catalog, orders, and pharmacy operations</p>
        </div>

        {/* Quick Credentials Auto Fill */}
        <div className="p-3.5 rounded-2xl bg-primary-50 border border-primary-200 text-xs text-navy-900 space-y-2">
          <p className="font-bold flex items-center gap-1.5 text-primary-900">
            <Sparkles size={14} className="text-primary-600" /> Demo Admin Credentials:
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fillSuperAdmin}
              className="flex-1 py-1.5 px-2 bg-white rounded-lg border border-primary-300 font-bold text-[11px] text-primary-800 hover:bg-primary-100 transition-colors"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={fillOrderManager}
              className="flex-1 py-1.5 px-2 bg-white rounded-lg border border-primary-300 font-bold text-[11px] text-primary-800 hover:bg-primary-100 transition-colors"
            >
              Order Manager
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                placeholder="admin@carewell.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input pl-10"
              />
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input pl-10"
              />
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full justify-center py-3 text-sm shadow-lg shadow-primary-500/25 disabled:opacity-50"
          >
            {submitting ? 'Authenticating...' : 'Sign In to Admin Portal'}
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-[11px] text-center text-gray-400 pt-2">
          Authorized personnel only. Access logs and actions are audited.
        </p>
      </div>
    </div>
  );
}
