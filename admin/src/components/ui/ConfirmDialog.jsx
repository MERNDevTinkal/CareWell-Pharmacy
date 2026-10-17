import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Are you sure?', message = 'This action cannot be undone.', confirmText = 'Confirm', danger = true }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card p-6 max-w-sm w-full bg-white space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${danger ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{message}</p>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline text-xs px-3 py-1.5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold text-white transition-colors ${danger ? 'bg-rose-500 hover:bg-rose-600' : 'bg-primary-500 hover:bg-primary-600'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
