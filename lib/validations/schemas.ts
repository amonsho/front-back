import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const profileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const hotelSchema = z.object({
  name: z.string().min(1, "Hotel name is required"),
  description: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  stars: z.number().min(1).max(5),
  image_url: z.string().url().optional().or(z.literal("")),
})

export const roomSchema = z.object({
  hotel_id: z.number(),
  name: z.string().min(1, "Room name is required"),
  description: z.string().optional(),
  room_type: z.string().min(1, "Room type is required"),
  price_per_night: z.number().min(0, "Price must be positive"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  is_available: z.boolean().default(true),
  image_url: z.string().url().optional().or(z.literal("")),
})

export const bookingSchema = z.object({
  room_id: z.number(),
  date_from: z.string(),
  date_to: z.string(),
  guests: z.number().min(1).default(1),
})

export const reviewSchema = z.object({
  hotel_id: z.number(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type HotelFormData = z.infer<typeof hotelSchema>
export type RoomFormData = z.infer<typeof roomSchema>
export type BookingFormData = z.infer<typeof bookingSchema>
export type ReviewFormData = z.infer<typeof reviewSchema>
