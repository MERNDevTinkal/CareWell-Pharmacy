export default function StatusBadge({ status }) {
  if (!status) return null;

  const map = {
    // Orders
    delivered: 'bg-green-100 text-green-800',
    shipped: 'bg-blue-100 text-blue-800',
    packed: 'bg-indigo-100 text-indigo-800',
    processing: 'bg-cyan-100 text-cyan-800',
    confirmed: 'bg-emerald-100 text-emerald-800',
    pending_confirmation: 'bg-amber-100 text-amber-800',
    prescription_review_pending: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-rose-100 text-rose-800',
    return_requested: 'bg-orange-100 text-orange-800',
    returned: 'bg-gray-200 text-gray-800',
    refunded: 'bg-rose-100 text-rose-800',
    // Prescriptions / General
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-rose-100 text-rose-800',
    pending: 'bg-amber-100 text-amber-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-600',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-rose-100 text-rose-800'
  };

  const style = map[status.toLowerCase()] || 'bg-gray-100 text-gray-700';

  return (
    <span className={`badge uppercase tracking-wider ${style}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
