import { api } from "./client"
import type { Room, RoomCreate, RoomUpdate } from "@/lib/types"

// Get rooms by hotel ID
export async function getRoomsByHotel(
  hotelId: number,
  limit = 100,
  offset = 0
): Promise<Room[]> {
  return api.get<Room[]>("/rooms/", { hotel_id: hotelId, limit, offset })
}

// Get all rooms (admin)
export async function getRooms(limit = 100, offset = 0): Promise<Room[]> {
  return api.get<Room[]>("/rooms/", { limit, offset })
}

// Get deleted rooms (admin)
export async function getDeletedRooms(
  limit = 100,
  offset = 0
): Promise<Room[]> {
  return api.get<Room[]>("/rooms/deleted", { limit, offset })
}

// Get room by ID
export async function getRoom(id: number): Promise<Room> {
  return api.get<Room>(`/rooms/${id}`)
}

// Create room (admin) uses FormData
export async function createRoom(data: RoomCreate): Promise<Room> {
  const formData = new FormData()
  formData.append("hotel_id", data.hotel_id.toString())
  formData.append("room_type", data.room_type)
  formData.append("number_room", data.number_room.toString())
  formData.append("price", data.price.toString())
  formData.append("wifi", data.wifi.toString())
  formData.append("photo", data.photo)

  return api.postForm<Room>("/rooms/", formData)
}

// Update room (admin) uses FormData
export async function updateRoom(id: number, data: RoomUpdate): Promise<Room> {
  const formData = new FormData()
  if (data.room_type) formData.append("room_type", data.room_type)
  if (data.number_room !== undefined) formData.append("number_room", data.number_room.toString())
  if (data.price !== undefined) formData.append("price", data.price.toString())
  if (data.wifi !== undefined) formData.append("wifi", data.wifi.toString())
  if (data.photo) formData.append("photo", data.photo)

  return api.patchForm<Room>(`/rooms/${id}`, formData)
}

// Delete room (admin)
export async function deleteRoom(id: number): Promise<void> {
  await api.delete(`/rooms/${id}`)
}

// Restore room (admin)
export async function restoreRoom(id: number): Promise<Room> {
  return api.post<Room>(`/rooms/${id}/restore`)
}
