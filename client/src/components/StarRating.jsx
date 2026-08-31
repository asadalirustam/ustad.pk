import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  rating = 0,
  maxStars = 5,
  interactive = false,
  onChange = () => {},
  size = 'md',
  showNumber = false,
  totalReviews = null
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const starClass = starSizes[size] || starSizes.md;

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(maxStars)].map((_, index) => {
          const starValue = index + 1;
          const isFilled =
            (hoverRating || rating) >= starValue ||
            (!interactive && rating >= starValue - 0.25);

          return (
            <button
              type="button"
              key={index}
              disabled={!interactive}
              onClick={() => interactive && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`${
                interactive ? 'cursor-pointer transition-transform hover:scale-125 focus:outline-none' : 'cursor-default'
              } p-0.5`}
            >
              <Star
                className={`${starClass} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-100 text-slate-300'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>

      {showNumber && (
        <span className="font-semibold text-slate-800 text-sm ml-1">
          {rating > 0 ? rating.toFixed(1) : 'New'}
        </span>
      )}

      {totalReviews !== null && (
        <span className="text-xs text-slate-500 ml-0.5">
          ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default StarRating;
