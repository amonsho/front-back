import { api } from "./client"
import type { Hotel, HotelCreate, HotelUpdate } from "@/lib/types"

// Get all hotels
export async function getHotels(
  limit = 100,
  offset = 0,
  city?: string,
  country?: string,
  q?: string
): Promise<Hotel[]> {
  const params: Record<string, string | number> = { limit, offset }
  if (city) params.q_city = city
  if (country) params.q_country = country
  if (q) params.q = q
  return api.get<Hotel[]>("/hotel/get_all", params)
}

// Search hotels (deprecated in favor of getHotels with combined filters)
export async function searchHotels(q: string): Promise<Hotel[]> {
  return getHotels(100, 0, undefined, undefined, q)
}

// Get hotel by ID
export async function getHotel(id: number): Promise<Hotel> {
  return api.get<Hotel>(`/hotel/${id}`)
}

// Create hotel (admin) uses FormData
export async function createHotel(data: HotelCreate): Promise<Hotel> {
  const formData = new FormData()
  formData.append("name", data.name)
  formData.append("address", data.address)
  formData.append("city", data.city)
  formData.append("country", data.country)
  if (data.description) formData.append("description", data.description)
  if (data.latitude !== undefined && data.latitude !== null) formData.append("latitude", data.latitude.toString())
  if (data.longitude !== undefined && data.longitude !== null) formData.append("longitude", data.longitude.toString())
  formData.append("photo", data.photo)
  
  return api.postForm<Hotel>("/hotel/", formData)
}

// Update hotel (admin) uses FormData
export async function updateHotel(id: number, data: HotelUpdate): Promise<Hotel> {
  const formData = new FormData()
  if (data.name) formData.append("name", data.name)
  if (data.address) formData.append("address", data.address)
  if (data.city) formData.append("city", data.city)
  if (data.country) formData.append("country", data.country)
  if (data.description) formData.append("description", data.description)
  if (data.latitude !== undefined && data.latitude !== null) formData.append("latitude", data.latitude.toString())
  if (data.longitude !== undefined && data.longitude !== null) formData.append("longitude", data.longitude.toString())
  if (data.photo) formData.append("photo", data.photo)

  return api.patchForm<Hotel>(`/hotel/${id}`, formData)
}

// Delete hotel (admin)
export async function deleteHotel(id: number): Promise<void> {
  await api.delete(`/hotel/${id}`)
}

// Get deleted hotels (admin)
export async function getDeletedHotels(
    limit = 100,
    offset = 0
): Promise<Hotel[]> {
    return api.get<Hotel[]>("/hotel/deleted", { limit, offset })
}

// Restore hotel (admin)
export async function restoreHotel(id: number): Promise<Hotel> {
  return api.post<Hotel>(`/hotel/${id}/restore`)
}
