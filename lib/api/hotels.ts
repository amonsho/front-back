import { api } from "./client"
import type { Hotel, HotelCreate, HotelUpdate } from "@/lib/types"

// Get all hotels
export async function getHotels(
  limit = 100,
  offset = 0,
  city?: string,
  country?: string
): Promise<Hotel[]> {
  const params: Record<string, string | number> = { limit, offset }
  if (city) params.city = city
  if (country) params.country = country
  return api.get<Hotel[]>("/hotel/get_all", params)
}

// Search hotels
export async function searchHotels(q: string): Promise<Hotel[]> {
  const response = await api.get<{ results: Hotel[] }>("/hotel/search_hotels", { q })
  return response.results
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
  if (data.description) formData.append("description", data.description)
  formData.append("photo", data.photo)
  
  return api.postForm<Hotel>("/hotel/", formData)
}

// Update hotel (admin) uses FormData
export async function updateHotel(id: number, data: HotelUpdate): Promise<Hotel> {
  const formData = new FormData()
  if (data.name) formData.append("name", data.name)
  if (data.address) formData.append("address", data.address)
  if (data.city) formData.append("city", data.city)
  if (data.description) formData.append("description", data.description)
  if (data.photo) formData.append("photo", data.photo)

  return api.patchForm<Hotel>(`/hotel/${id}`, formData)
}

// Delete hotel (admin)
export async function deleteHotel(id: number): Promise<void> {
  await api.delete(`/hotel/${id}`)
}
