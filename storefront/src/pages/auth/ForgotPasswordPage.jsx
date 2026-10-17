import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, Sparkles, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [demoToken, setDemoToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const res = await authService.forgotPassword(email);
      toast.success(res.data?.message || 'Password reset link sent!');
      // In demo mode backend returns resetToken
      if (res.data?.resetToken) {
        setDemoToken(res.data.resetToken);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to request password reset');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-500 text-white font-bold text-xl flex items-center justify-center">
              C
            </div>
            <span className="text-2xl font-black text-navy-900 tracking-tight">CareWell</span>
          </Link>
          <h1 className="text-xl font-bold text-navy-900">Forgot Password</h1>
          <p className="text-xs text-gray-500">
            Enter your registered email and we'll generate a secure password reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Registered Email</label>
            <div className="relative">
              <input
                type="email"
                placeholder="john@demo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input pl-10"
              />
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full justify-center text-sm py-3 shadow-lg shadow-primary-500/25 disabled:opacity-50"
          >
            {submitting ? 'Sending Request...' : 'Send Reset Link'}
            <Send size={15} />
          </button>
        </form>

        {/* Demo Mode Token Reveal Box */}
        {demoToken && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2 text-amber-900">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-600" /> Demo Mode Password Reset Token
            </p>
            <p className="text-[11px] text-amber-800 break-all font-mono bg-white p-2 rounded-lg border border-amber-200">
              {demoToken}
            </p>
            <Link
              to={`/reset-password/${demoToken}`}
              className="btn-primary w-full justify-center text-xs py-2 mt-2"
            >
              Click Here to Reset Password <ArrowRight size={14} />
            </Link>
          </div>
        )}

        <div className="pt-2 text-center">
          <Link to="/login" className="text-xs font-semibold text-gray-500 hover:text-navy-900 inline-flex items-center gap-1.5">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
