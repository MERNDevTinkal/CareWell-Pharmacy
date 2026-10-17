import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center text-xs text-gray-500 py-3" aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li>
          <Link to="/" className="text-gray-400 hover:text-primary-600 flex items-center gap-1">
            <Home size={14} />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight size={12} className="text-gray-300" />
              {isLast || !item.url ? (
                <span className="font-semibold text-navy-900 truncate max-w-[200px]">
                  {item.label}
                </span>
              ) : (
                <Link to={item.url} className="hover:text-primary-600 transition-colors">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
