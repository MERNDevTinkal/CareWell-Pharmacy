import { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cmsService } from '../services/cmsService';
import Breadcrumb from '../components/ui/Breadcrumb';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cmsService.getFAQs()
      .then(res => setFaqs(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(faqs.map(f => f.category || 'General'))];
  const filtered = activeCategory === 'All' ? faqs : faqs.filter(f => f.category === activeCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumb items={[{ label: 'Help & FAQs' }]} />

      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-black text-navy-900">Frequently Asked Questions</h1>
        <p className="text-sm text-gray-500">
          Find answers regarding medicine orders, prescription guidelines, delivery times, and returns.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setOpenIndex(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === cat
                ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner size="lg" text="Loading FAQs..." />
      ) : (
        <div className="space-y-3">
          {filtered.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq._id || idx}
                className="card bg-white overflow-hidden border border-gray-200 transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-navy-900"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle size={18} className="text-primary-500 flex-shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-primary-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs text-gray-600 leading-relaxed border-t border-gray-50 mt-1">
                    <p className="pt-3">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

