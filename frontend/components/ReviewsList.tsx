"use client";

import { useEffect, useState } from "react";
import { RatingStars } from "./RatingStars";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Review {
  _id: string;
  rating: number;
  comment: string;
  user: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface ReviewsListProps {
  productId: string;
}

export function ReviewsList({ productId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingInfo, setRatingInfo] = useState<{
    averageRating: number;
    numReviews: number;
  }>({
    averageRating: 0,
    numReviews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch reviews
        const reviewsRes = await fetch(`/api/reviews/product/${productId}`);
        const reviewsData = await reviewsRes.json();

        // Fetch rating info
        const ratingRes = await fetch(
          `/api/reviews/product/${productId}/rating`,
        );
        const ratingData = await ratingRes.json();

        if (reviewsRes.ok) {
          setReviews(reviewsData);
        }

        if (ratingRes.ok) {
          setRatingInfo(ratingData);
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setError("Failed to load reviews");
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No reviews yet</p>
          <p className="text-sm text-muted-foreground">
            Be the first to review this product
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="flex items-center gap-4">
        <div>
          <div className="text-3xl font-bold">{ratingInfo.averageRating}</div>
          <RatingStars rating={ratingInfo.averageRating} size="md" />
          <p className="text-sm text-muted-foreground mt-1">
            Based on {ratingInfo.numReviews}{" "}
            {ratingInfo.numReviews === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review._id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium">
                    {review.user?.name || "Anonymous"}
                  </p>
                  <RatingStars rating={review.rating} size="sm" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className="text-muted-foreground">{review.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
