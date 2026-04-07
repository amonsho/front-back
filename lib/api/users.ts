import { api } from "./client"
import type { User, Profile } from "@/lib/types"

// Get current user
export async function getCurrentUser(): Promise<User> {
  return api.get<User>("/users/me")
}

// Change password
export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  await api.post("/users/change-password", {
    old_password: oldPassword,
    new_password: newPassword,
  })
}

// Get profile
export async function getProfile(): Promise<Profile> {
  return api.get<Profile>("/profile/")
}

// Update profile
export async function updateProfile(data: Partial<Profile>): Promise<Profile> {
  return api.patch<Profile>("/profile/", data)
}

// Upload avatar
export async function uploadAvatar(file: File): Promise<{ avatar: string }> {
  const formData = new FormData()
  formData.append("file", file)
  return api.postForm<{ avatar: string }>("/profile/avatar", formData)
}
