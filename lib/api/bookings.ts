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

// Cancel booking
export async function cancelBooking(id: number): Promise<void> {
  await api.delete(`/booking/${id}`)
}
