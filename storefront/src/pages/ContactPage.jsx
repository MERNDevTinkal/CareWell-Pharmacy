import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import Breadcrumb from '../components/ui/Breadcrumb';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const { settings } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/contact/enquiry', formData);
      toast.success('Your message has been sent to our customer care team!');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error('Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Breadcrumb items={[{ label: 'Contact Us' }]} />

      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-black text-navy-900">Get in Touch</h1>
        <p className="text-sm text-gray-500">
          Have questions about medication availability, dosage guidelines, or orders? Our clinical support team is here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Contact Info Box */}
        <div className="md:col-span-5 space-y-6">
          <div className="card p-6 bg-navy-900 text-white space-y-6">
            <h2 className="text-lg font-bold">Contact Information</h2>
            <div className="space-y-4 text-xs text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-primary-400 flex-shrink-0 mt-0.5" />
                <span>{settings?.contactAddress || '123 Health Avenue, MG Road, Bangalore - 560001, Karnataka, India'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-primary-400 flex-shrink-0" />
                <span>{settings?.contactPhone || '+91 98765 43210'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-primary-400 flex-shrink-0" />
                <span>{settings?.contactEmail || 'support@carewell.com'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-navy-800 text-xs text-gray-400 space-y-1">
              <p className="font-bold text-white">Pharmacist Working Hours:</p>
              <p>Monday – Saturday: 8:00 AM – 10:00 PM</p>
              <p>Sunday: 9:00 AM – 6:00 PM</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 card p-8 bg-white">
          <h2 className="text-lg font-bold text-navy-900 mb-6">Send an Inquiry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Order query, medicine availability"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">Message *</label>
              <textarea
                rows={4}
                required
                placeholder="How can our pharmacy team assist you today?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-xs px-8 py-3.5 shadow-lg shadow-primary-500/25 disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Message'}
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

