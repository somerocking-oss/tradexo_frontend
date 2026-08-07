"use client";

import { useCallback, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getBusinessReviews } from "@/lib/api/review";
import { WriteReviewForm } from "@/components/business/WriteReviewForm";
import type { Review } from "@/types";

export function BusinessReviews({ businessId }: { businessId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(() => {
    setLoading(true);
    getBusinessReviews(businessId)
      .then((res) => {
        if (res.success && res.data) setReviews(Array.isArray(res.data) ? res.data : []);
      })
      .finally(() => setLoading(false));
  }, [businessId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">User Reviews & Ratings</h2>
        {reviews.length > 0 && (
          <span className="flex items-center gap-1 text-sm font-medium text-amber-600">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {avgRating.toFixed(1)} · {reviews.length} review{reviews.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="mb-6">
        <WriteReviewForm businessId={businessId} onSubmitted={loadReviews} />
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-slate-500">No reviews yet. Be the first to review!</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review._id} className="border-b border-slate-100 pb-4 last:border-0">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-medium text-slate-900">
                  {review.userName || "User"}
                </span>
                <span className="flex items-center gap-0.5 text-amber-600">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                    />
                  ))}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-slate-700">{review.comment}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
