import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartPulse,
  RotateCcw,
  Star,
  Upload,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { homepageService } from '../services/homepageService';
import ProductCard from '../components/product/ProductCard';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton';

export default function HomePage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    homepageService.getSections()
      .then(res => setSections(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        <div className="h-96 rounded-3xl bg-gray-100 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-16">
      {sections.map((section) => {
        if (!section.isVisible) return null;

        // 1. Hero Banner
        if (section.type === 'hero_banner') {
          return (
            <section key={section._id} className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-16 md:py-24 border-b border-emerald-100/60">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                  <div className="md:col-span-7 space-y-6 text-center md:text-left">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-800 tracking-wide uppercase">
                      <ShieldCheck size={14} /> {section.subtitle || 'Verified Online Pharmacy'}
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-900 leading-tight tracking-tight">
                      {section.title || 'Your Health, Our Priority'}
                    </h1>
                    <p className="text-base sm:text-lg text-navy-700 max-w-xl leading-relaxed">
                      {section.description || 'Order 100% genuine medicines, wellness essentials and vitamins with doorstep delivery.'}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-2">
                      <Link
                        to={section.ctaLink || '/products'}
                        className="btn-primary w-full sm:w-auto justify-center text-sm px-8 py-3.5 shadow-lg shadow-primary-500/25"
                      >
                        {section.ctaText || 'Shop Medicines'}
                        <ArrowRight size={16} />
                      </Link>
                      <Link
                        to="/upload-prescription"
                        className="btn-secondary w-full sm:w-auto justify-center text-sm px-6 py-3.5"
                      >
                        <Upload size={16} /> Upload Prescription
                      </Link>
                    </div>
                  </div>

                  <div className="md:col-span-5 flex justify-center">
                    <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl bg-white p-4 border border-emerald-100">
                      <img
                        src={section.image || 'https://placehold.co/600x600?text=CareWell+Pharmacy'}
                        alt="CareWell Hero"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center font-bold">
                          ✓
                        </div>
                        <div>
                          <p className="text-xs font-bold text-navy-900">100% Authentic Medications</p>
                          <p className="text-[11px] text-gray-500">Certified by Registered Pharmacists</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // 2. Category Collection
        if (section.type === 'category_collection') {
          return (
            <section key={section._id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">
                    {section.title || 'Shop by Category'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {section.subtitle || 'Explore healthcare essentials categorized for easy shopping'}
                  </p>
                </div>
                <Link to="/products" className="text-primary-600 hover:text-primary-700 text-xs font-bold inline-flex items-center gap-1">
                  View All <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {section.categories?.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/products?category=${cat.slug}`}
                    className="group card p-4 flex flex-col items-center text-center hover:border-primary-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div
                      style={{ backgroundColor: cat.color ? `${cat.color}15` : '#ecfdf5' }}
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                    >
                      <img
                        src={cat.image || 'https://placehold.co/100x100?text=Cat'}
                        alt={cat.name}
                        className="w-10 h-10 object-contain mix-blend-multiply"
                      />
                    </div>
                    <h3 className="text-xs font-bold text-navy-900 group-hover:text-primary-600 transition-colors">
                      {cat.name}
                    </h3>
                  </Link>
                ))}
              </div>
            </section>
          );
        }

        // 3. Featured / Best Seller / Wellness Product Sections
        if (['featured_products', 'best_sellers', 'wellness_collection', 'offers', 'new_arrivals'].includes(section.type)) {
          if (!section.products || section.products.length === 0) return null;

          return (
            <section key={section._id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="text-sm text-gray-500 mt-1">{section.subtitle}</p>
                  )}
                </div>
                <Link to="/products" className="text-primary-600 hover:text-primary-700 text-xs font-bold inline-flex items-center gap-1">
                  Browse All <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {section.products.slice(0, 8).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          );
        }

        // 4. Prescription Promotion Banner
        if (section.type === 'prescription_promo') {
          return (
            <section key={section._id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-primary-950 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl space-y-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-500/20 text-primary-300 border border-primary-500/30">
                    <FileCheck size={14} /> Pharmacist Verified Dispensing
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black leading-tight">
                    {section.title || 'Have a Doctor’s Prescription?'}
                  </h2>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {section.description || 'Simply upload a photo or document of your prescription. Our licensed pharmacists verify dosage and drug interactions, pack your order, and dispatch directly to your doorstep.'}
                  </p>
                  <div className="pt-2">
                    <Link
                      to={section.ctaLink || '/upload-prescription'}
                      className="btn-primary text-sm shadow-lg shadow-primary-500/25"
                    >
                      <Upload size={16} />
                      {section.ctaText || 'Upload Prescription'}
                    </Link>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-4">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-400 text-navy-900 flex items-center justify-center font-bold text-sm">1</div>
                    <span className="text-xs font-medium">Upload prescription photo</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-400 text-navy-900 flex items-center justify-center font-bold text-sm">2</div>
                    <span className="text-xs font-medium">Pharmacist reviews & confirms</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-400 text-navy-900 flex items-center justify-center font-bold text-sm">3</div>
                    <span className="text-xs font-medium">Delivered to your home</span>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // 5. Why Choose CareWell / Trust Section
        if (section.type === 'trust_info') {
          const points = section.customData?.points || [
            { title: '100% Authentic', description: 'Procured directly from verified pharmaceutical manufacturers.' },
            { title: 'Express Delivery', description: 'Fast doorstep delivery across all metro hubs.' },
            { title: 'Licensed Pharmacists', description: 'Rigorous prescription checks for your health safety.' },
            { title: 'Easy Returns', description: '7-day hassle-free returns on eligible wellness items.' }
          ];

          return (
            <section key={section._id} className="bg-gray-50 py-16 border-y border-gray-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-xl mx-auto mb-12">
                  <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">
                    {section.title || 'Why Choose CareWell Pharmacy?'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-2">
                    {section.subtitle || 'Healthcare backed by uncompromising quality, clinical expertise, and compassion'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {points.map((pt, idx) => (
                    <div key={idx} className="card p-6 bg-white hover:border-primary-200 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center mb-4">
                        <CheckCircle size={22} />
                      </div>
                      <h3 className="text-base font-bold text-navy-900 mb-1">{pt.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{pt.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // 6. Testimonials
        if (section.type === 'testimonials') {
          const reviews = section.customData?.reviews || [];
          if (reviews.length === 0) return null;

          return (
            <section key={section._id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-xl mx-auto mb-12">
                <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">
                  {section.title || 'What Our Patients Say'}
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  {section.subtitle || 'Real feedback from satisfied customers across India'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reviews.map((r, i) => (
                  <div key={i} className="card p-6 bg-white flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex items-center text-amber-400 gap-1 mb-3">
                        {Array(r.rating || 5).fill(0).map((_, idx) => (
                          <Star key={idx} size={16} fill="currentColor" />
                        ))}
                      </div>
                      <p className="text-xs text-navy-800 italic leading-relaxed mb-4">
                        "{r.comment}"
                      </p>
                    </div>
                    <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center">
                        {r.name?.[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-navy-900">{r.name}</p>
                        <p className="text-[10px] text-gray-400">{r.role || 'Verified Customer'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}

