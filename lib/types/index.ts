// User types
export type UserRole = "user" | "admin"

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  avatar?: string | null
  google_id?: string | null
  is_verified: boolean
  created_at: string
}

export interface Profile {
  id: number
  user_id: number
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  avatar_url?: string | null
}

export interface UserWithProfile extends User {
  profile?: Profile | null
}

// Auth types
export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
  password2: string
}

// Hotel types
export interface Hotel {
  id: number
  name: string
  description?: string | null
  address: string
  city: string
  country: string
  photo?: string | null
  latitude?: number | null
  longitude?: number | null
  created_at?: string
}

export interface HotelCreate {
  name: string
  description?: string
  address: string
  city: string
  country: string
  latitude?: number | null
  longitude?: number | null
  photo: File
}

export interface HotelUpdate {
  name?: string
  description?: string
  address?: string
  city?: string
  country?: string
  latitude?: number | null
  longitude?: number | null
  photo?: File
}

// Room types
export interface Room {
  id: number
  hotel_id: number
  room_type: string
  number_room: number
  price: number
  wifi: boolean
  photo?: string | null
  is_available?: boolean
}

export interface RoomCreate {
  hotel_id: number
  room_type: string
  number_room: number
  price: number
  wifi: boolean
  photo: File
}

export interface RoomUpdate {
  room_type?: string
  number_room?: number
  price?: number
  wifi?: boolean
  photo?: File
}

// Booking types
export interface Booking {
  id: number
  user_id: number
  room_id: number
  date_from: string
  date_to: string
  total_price: number | null
  status: "pending" | "confirmed" | "cancelled"
  guests: number
  created_at?: string | null
  room?: Room
  hotel?: Hotel
}

export interface BookingCreate {
  room_id: number
  date_from: string
  date_to: string
  guests: number
}

// Review types
export interface Review {
  id: number
  user_id: number
  hotel_id: number
  rating: number
  comment?: string | null
  created_at?: string | null
  user?: {
    name: string
    avatar?: string | null
  }
}

export interface ReviewCreate {
  hotel_id: number
  rating: number
  comment?: string
}

export interface HotelReviewsResponse {
  reviews: Review[]
  average_rating: number
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

// API Error
export interface ApiError {
  detail: string
}

// Reports
export interface HotelsCountReport {
  total_hotels: number
  total_rooms: number
  total_users: number
  total_bookings: number
  by_city: Record<string, number>
  by_country: Record<string, number>
}
