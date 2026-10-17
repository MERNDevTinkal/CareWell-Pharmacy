export default function StatsCard({ title, value, icon: Icon, color = 'primary', subtitle }) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="card p-5 bg-white space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.primary}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-black text-navy-900">{value}</h3>
        {subtitle && <p className="text-[11px] text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
