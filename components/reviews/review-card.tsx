"use client"

import { format } from "date-fns"
import type { Review } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getImageUrl } from "@/lib/api/config"
import { Star } from "lucide-react"

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  const initials = review.user?.name?.slice(0, 2).toUpperCase() || "U"

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarImage src={getImageUrl(review.user?.avatar)} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">{review.user?.name || "Anonymous"}</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? "fill-accent text-accent"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {review.created_at ? (() => {
              try {
                const date = new Date(review.created_at)
                // Check if date is valid
                if (isNaN(date.getTime())) {
                   return new Date().toLocaleDateString()
                }
                return format(date, "MMM d, yyyy")
              } catch {
                return new Date().toLocaleDateString()
              }
            })() : ""}
          </p>
          {review.comment && (
            <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  )
}
