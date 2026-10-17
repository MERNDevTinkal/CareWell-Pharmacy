import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password
      });
      toast.success('Registration successful! Welcome to CareWell.');
      navigate('/account');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
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
          <h1 className="text-xl font-bold text-navy-900">Create an Account</h1>
          <p className="text-xs text-gray-500">Join CareWell Pharmacy for fast orders and easy refills</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Rohan Sharma"
                {...register('name')}
                className="input pl-10"
              />
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="rohan@example.com"
                {...register('email')}
                className="input pl-10"
              />
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                placeholder="+91 9876543210"
                {...register('phone')}
                className="input pl-10"
              />
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="label">Password</label>
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

          <div>
            <label className="label">Confirm Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                className="input pl-10"
              />
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {errors.confirmPassword && <p className="text-[11px] text-rose-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full justify-center text-sm py-3 shadow-lg shadow-primary-500/25 disabled:opacity-50"
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-xs text-center text-gray-500 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
