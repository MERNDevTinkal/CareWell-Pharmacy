import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center flex items-center justify-center">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm transition-opacity"
        />

        <div className={`inline-block w-full ${maxWidth} p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl relative z-10`}>
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <h3 className="text-lg font-bold text-navy-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-gray-400 hover:text-navy-900 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
