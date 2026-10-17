import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/account';

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await login(values);
      toast.success('Welcome back to CareWell!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSocial = async (provider) => {
    setSubmitting(true);
    try {
      await demoLogin(provider);
      toast.success(`Logged in with Demo ${provider === 'google' ? 'Google' : 'Facebook'}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCustomer = () => {
    setValue('email', 'john@demo.com');
    setValue('password', 'Demo@123');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-500 text-white font-bold text-xl flex items-center justify-center">
              C
            </div>
            <span className="text-2xl font-black text-navy-900 tracking-tight">CareWell</span>
          </Link>
          <h1 className="text-xl font-bold text-navy-900">Welcome Back</h1>
          <p className="text-xs text-gray-500">Sign in to manage prescriptions, orders and refills</p>
        </div>

        {/* Demo Credentials Quick Fill Banner */}
        <div className="p-3.5 rounded-2xl bg-primary-50 border border-primary-200 text-xs text-navy-800 flex items-center justify-between">
          <div>
            <p className="font-bold text-primary-900 flex items-center gap-1">
              <Sparkles size={14} className="text-primary-600" /> Demo Account
            </p>
            <p className="text-[11px] text-gray-500">john@demo.com / Demo@123</p>
          </div>
          <button
            type="button"
            onClick={fillDemoCustomer}
            className="text-[11px] font-bold text-primary-700 bg-white px-2.5 py-1 rounded-lg border border-primary-200 hover:bg-primary-100"
          >
            Auto Fill
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className="input pl-10"
              />
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-navy-700">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-primary-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className="input pl-10 pr-10"
              />
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-900"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-[11px] text-rose-500 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full justify-center text-sm py-3 shadow-lg shadow-primary-500/25 disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Social Authentication */}
        <div className="space-y-3 pt-2">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-gray-400 font-semibold absolute">
              Or Demo Social Login
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDemoSocial('google')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-navy-800 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Demo Google
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDemoSocial('facebook')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-navy-800 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Demo Facebook
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center">
            *Demo social login creates or uses a test profile without real external OAuth.
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-gray-500 pt-2">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-primary-600 hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}
