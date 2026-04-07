"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { createReview } from "@/lib/api/reviews"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Star, Loader2 } from "lucide-react"

interface ReviewFormProps {
  hotelId: number
  onSuccess: () => void
}

export function ReviewForm({ hotelId, onSuccess }: ReviewFormProps) {
  const t = useTranslations("reviews")
  const { isLoggedIn } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  if (!isLoggedIn) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    setIsLoading(true)
    try {
      await createReview({
        hotel_id: hotelId,
        rating,
        comment: comment || undefined,
      })
      toast.success(t("reviewAdded"))
      setRating(0)
      setComment("")
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add review")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border p-4">
      <h4 className="mb-4 font-medium">Write a Review</h4>
      
      <div className="mb-4">
        <Label className="mb-2 block">{t("rating")}</Label>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              onMouseEnter={() => setHoverRating(i + 1)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  i < (hoverRating || rating)
                    ? "fill-accent text-accent"
                    : "fill-muted text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor="comment" className="mb-2 block">
          {t("comment")}
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isLoading || rating === 0}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t("submitReview")}
      </Button>
    </form>
  )
}
