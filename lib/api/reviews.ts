import { api } from "./client"
import type { Review, ReviewCreate } from "@/lib/types"

// Create review
export async function createReview(data: ReviewCreate): Promise<Review> {
  return api.post<Review>("/reviews/", data)
}

// Get reviews by hotel ID
export async function getReviewsByHotel(hotelId: number): Promise<Review[]> {
  return api.get<Review[]>(`/reviews/hotel/${hotelId}`)
}

// Delete review
export async function deleteReview(id: number): Promise<void> {
  await api.delete(`/reviews/${id}`)
}
