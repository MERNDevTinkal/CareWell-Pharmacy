export default function DataTable({ columns = [], data = [], loading = false, emptyMessage = 'No records found' }) {
  if (loading) {
    return (
      <div className="card p-12 text-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary-500 border-t-transparent mx-auto mb-2" />
        <p className="text-xs text-gray-400 font-semibold">Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card p-12 text-center bg-white">
        <p className="text-xs text-gray-400 font-semibold">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="card bg-white overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className={`p-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-navy-800">
            {data.map((row, rIdx) => (
              <tr key={row._id || rIdx} className="hover:bg-gray-50/60 transition-colors">
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className={`p-4 ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
