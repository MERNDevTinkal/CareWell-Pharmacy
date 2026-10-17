export default function ProductCardSkeleton() {
  return (
    <div className="card animate-pulse flex flex-col justify-between">
      <div className="aspect-square bg-gray-200 rounded-t-2xl m-3" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-3 bg-gray-200 rounded w-12" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="flex gap-2 items-center pt-2">
          <div className="h-5 bg-gray-200 rounded w-14" />
          <div className="h-3 bg-gray-200 rounded w-10" />
        </div>
        <div className="h-9 bg-gray-200 rounded-xl w-full" />
      </div>
    </div>
  );
}
