export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const dim = size === 'lg' ? 'h-12 w-12 border-4' : size === 'sm' ? 'h-6 w-6 border-2' : 'h-8 w-8 border-3';
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div className={`animate-spin rounded-full ${dim} border-primary-500 border-t-transparent`} />
      {text && <p className="text-xs font-semibold text-gray-500">{text}</p>}
    </div>
  );
}
