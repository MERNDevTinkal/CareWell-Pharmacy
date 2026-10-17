export default function PriceDisplay({ price, mrp, discount, size = 'md' }) {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className={`font-black text-navy-900 ${isLarge ? 'text-3xl' : isSmall ? 'text-base' : 'text-xl'}`}>
        ₹{price}
      </span>
      {mrp > price && (
        <>
          <span className={`text-gray-400 line-through ${isLarge ? 'text-lg' : 'text-xs'}`}>
            ₹{mrp}
          </span>
          <span className="badge bg-green-100 text-green-700 font-bold text-xs">
            {discount || Math.round(((mrp - price) / mrp) * 100)}% OFF
          </span>
        </>
      )}
    </div>
  );
}
