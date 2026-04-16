import { api } from "./client"
import type { User, UserRole, HotelsCountReport, Booking } from "@/lib/types"
import { deleteBooking } from "./bookings"

// Get all users (admin)
export async function getUsers(limit = 100, offset = 0): Promise<User[]> {
  return api.get<User[]>("/admin/users", { limit, offset })
}

// Delete user (admin)
export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/admin/users/${id}`)
}

// Get deleted users (admin)
export async function getDeletedUsers(limit = 100, offset = 0): Promise<User[]> {
  return api.get<User[]>("/admin/users/deleted", { limit, offset })
}

// Restore user (admin)
export async function restoreUser(id: number): Promise<User> {
  return api.post<User>(`/admin/users/${id}/restore`)
}

// Change user role (admin)
export async function changeUserRole(id: number, role: UserRole): Promise<User> {
  return api.patch<User>(`/admin/users/${id}/role`, { role })
}

// Get hotels count report
export async function getHotelsCountReport(): Promise<HotelsCountReport> {
  return api.get<HotelsCountReport>("/hotel/reports/hotels_count")
}

// Get all bookings (admin)
export async function getAllBookings(limit = 100, offset = 0): Promise<Booking[]> {
  return api.get<Booking[]>("/booking/all", { limit, offset })
}

// Get soft-deleted bookings (admin)
export async function getDeletedBookings(): Promise<Booking[]> {
  return api.get<Booking[]>("/booking/deleted")
}

// Restore booking (admin)
export async function restoreBooking(id: number): Promise<Booking> {
  return api.post<Booking>(`/booking/${id}/restore`)
}

// Hard delete booking (admin only — no refund)
export { deleteBooking }

// Create payment (Stripe checkout session)
export async function createPayment(
  bookingId: number,
  amount: number,
  provider = "stripe"
): Promise<{ checkout_url: string; session_id?: string }> {
  return api.post("/payment/payments/create", {
    booking_id: bookingId,
    amount,
    provider,
  })
}
