import { api } from "./client"
import type { User, UserRole, HotelsCountReport, Booking } from "@/lib/types"

// Get all users (admin)
export async function getUsers(limit = 100, offset = 0): Promise<User[]> {
  return api.get<User[]>("/admin/users", { limit, offset })
}

// Delete user (admin)
export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/admin/users/${id}`)
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
