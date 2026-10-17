import { Star } from 'lucide-react';

export default function RatingStars({ rating = 0, count, showCount = true, size = 16 }) {
  const rounded = Math.round(rating * 2) / 2;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            fill={rounded >= star ? 'currentColor' : 'none'}
            className={rounded >= star ? 'text-amber-400' : 'text-gray-300'}
          />
        ))}
      </div>
      {showCount && (
        <span className="text-xs font-semibold text-gray-500">
          {rating > 0 ? rating.toFixed(1) : 'No reviews'}
          {count !== undefined && count > 0 && ` (${count})`}
        </span>
      )}
    </div>
  );
}
