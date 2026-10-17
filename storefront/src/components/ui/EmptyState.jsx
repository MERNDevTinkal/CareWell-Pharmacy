import { PackageX } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = PackageX,
  title = 'No items found',
  description = 'Try adjusting your search or filters to find what you are looking for.',
  actionText,
  actionLink,
  onAction
}) {
  return (
    <div className="card p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
        <Icon size={32} />
      </div>
      <h3 className="text-lg font-bold text-navy-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>
      {actionText && (
        actionLink ? (
          <Link to={actionLink} className="btn-primary text-xs">
            {actionText}
          </Link>
        ) : (
          <button onClick={onAction} className="btn-primary text-xs">
            {actionText}
          </button>
        )
      )}
    </div>
  );
}
