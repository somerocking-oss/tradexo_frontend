"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { createReview } from "@/lib/api/review";

interface WriteReviewFormProps {
  businessId: string;
  onSubmitted?: () => void;
}

export function WriteReviewForm({ businessId, onSubmitted }: WriteReviewFormProps) {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setError("Please select a star rating");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await createReview({ businessId, rating, comment: comment.trim() || undefined });
      if (res.success) {
        setSuccess(true);
        setComment("");
        setRating(0);
        onSubmitted?.();
      } else {
        setError(res.message || "Could not submit review");
      }
    } catch {
      setError("Could not submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600">
        <Link href={`/login?redirect=/business/${businessId}`} className="font-medium text-[#ff6c00] hover:underline">
          Login
        </Link>{" "}
        to write a review for this business
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        Thank you! Your review has been submitted.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-3 text-sm font-medium text-slate-900">Write a Review</p>

      <div className="mb-3 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;
          const active = value <= (hover || rating);
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              className="rounded p-0.5 transition hover:scale-110"
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
            >
              <Star
                className={`h-6 w-6 ${active ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
              />
            </button>
          );
        })}
        {rating > 0 && <span className="ml-2 text-sm text-slate-600">{rating}/5</span>}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Share your experience (optional)"
        className="mb-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#ff6c00] focus:ring-2 focus:ring-[#e8e8e8]"
        maxLength={1000}
      />

      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      <Button type="submit" size="sm" loading={loading} disabled={rating < 1}>
        Submit Review
      </Button>
    </form>
  );
}
