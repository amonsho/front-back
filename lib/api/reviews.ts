import { api } from "./client"
import type { Review, ReviewCreate, HotelReviewsResponse } from "@/lib/types"

// Create review
export async function createReview(data: ReviewCreate): Promise<Review> {
  return api.post<Review>("/reviews/", data)
}

// Get reviews by hotel ID — returns both reviews array and average rating
export async function getReviewsByHotel(
  hotelId: number
): Promise<HotelReviewsResponse> {
  return api.get<HotelReviewsResponse>(`/reviews/hotel/${hotelId}`)
}

// Convenience: get only the reviews array
export async function getReviewsList(hotelId: number): Promise<Review[]> {
  const res = await getReviewsByHotel(hotelId)
  return res.reviews
}

// Delete review
export async function deleteReview(id: number): Promise<void> {
  await api.delete(`/reviews/${id}`)
}
