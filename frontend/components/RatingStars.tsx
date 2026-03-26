"use client";

import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  reviewCount,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const displayRating =
    typeof rating === "number" ? Math.round(rating * 10) / 10 : 0;

  return (
    <div className="flex items-center gap-1">
      {/* Render stars */}
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.floor(displayRating);
        const isHalfFilled =
          starValue === Math.ceil(displayRating) && displayRating % 1 !== 0;

        return (
          <Star
            key={index}
            className={`${sizeClasses[size]} ${
              isFilled
                ? "fill-yellow-400 text-yellow-400"
                : isHalfFilled
                  ? "fill-yellow-400/50 text-yellow-400"
                  : "fill-muted text-muted"
            }`}
          />
        );
      })}

      {/* Show numeric value */}
      {showValue && (
        <span className="ml-1 text-sm font-medium">
          {displayRating.toFixed(1)}
        </span>
      )}

      {/* Show review count */}
      {reviewCount !== undefined && (
        <span className="text-sm text-muted-foreground">
          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  );
}
