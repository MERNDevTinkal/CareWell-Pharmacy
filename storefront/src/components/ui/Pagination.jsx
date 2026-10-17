import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page = 1, pages = 1, onPageChange }) {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 py-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Previous Page"
      >
        <ChevronLeft size={16} />
      </button>

      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
        // Show first, last, and around current
        if (p === 1 || p === pages || (p >= page - 1 && p <= page + 1)) {
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                p === page
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                  : 'border border-gray-200 text-navy-800 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          );
        } else if (p === page - 2 || p === page + 2) {
          return <span key={p} className="px-1 text-gray-400">...</span>;
        }
        return null;
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next Page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
