import { api } from "./client"
import type { Booking, BookingCreate } from "@/lib/types"

// Create booking
export async function createBooking(data: BookingCreate): Promise<Booking> {
  return api.post<Booking>("/booking/", data)
}

// Get current user's bookings
export async function getMyBookings(): Promise<Booking[]> {
  return api.get<Booking[]>("/booking/me")
}

// Cancel booking (calls POST /booking/{id}/cancel — triggers Stripe refund)
export async function cancelBooking(id: number): Promise<{
  status: string
  refund?: string
  refund_id?: string
}> {
  return api.post(`/booking/${id}/cancel`)
}

// Delete booking — admin only (hard delete, no refund)
export async function deleteBooking(id: number): Promise<void> {
  await api.delete(`/booking/${id}`)
}
