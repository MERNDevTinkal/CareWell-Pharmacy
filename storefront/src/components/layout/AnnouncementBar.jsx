import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { Link } from 'react-router-dom';

export default function AnnouncementBar() {
  const [closed, setClosed] = useState(false);
  const { settings } = useStore();
  const bar = settings?.announcementBar;

  if (!bar?.enabled || closed || !bar?.text) return null;

  return (
    <div
      style={{
        backgroundColor: bar.bgColor || '#10b981',
        color: bar.textColor || '#ffffff'
      }}
      className="py-2 px-4 text-center text-xs md:text-sm font-medium relative transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 pr-6">
        <span>{bar.text}</span>
        {bar.link && (
          <Link to={bar.link} className="underline font-semibold hover:opacity-80 inline-flex items-center gap-0.5">
            Shop Now <ArrowRight size={14} />
          </Link>
        )}
      </div>
      <button
        onClick={() => setClosed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100 p-1 rounded-full transition-opacity"
        aria-label="Close Announcement"
      >
        <X size={15} />
      </button>
    </div>
  );
}
