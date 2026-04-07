import type { TokenPair, ApiError } from "@/lib/types"

import { API_URL } from "./config"

// Token storage keys
const ACCESS_TOKEN_KEY = "access_token"
const REFRESH_TOKEN_KEY = "refresh_token"

// Get tokens from localStorage
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

// Save tokens to localStorage
export function saveTokens(tokens: TokenPair): void {
  if (typeof window === "undefined") return
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
}

// Clear tokens from localStorage
export function clearTokens(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAccessToken()
}

// Refresh access token using refresh token
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) {
      clearTokens()
      return false
    }

    const tokens: TokenPair = await response.json()
    saveTokens(tokens)
    return true
  } catch {
    clearTokens()
    return false
  }
}

// API client class
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const accessToken = getAccessToken()

    const headers: HeadersInit = {
      ...options.headers,
    }

    // Add auth header if token exists
    if (accessToken) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`
    }

    // Add Content-Type for JSON requests (if not FormData)
    if (!(options.body instanceof FormData)) {
      (headers as Record<string, string>)["Content-Type"] = "application/json"
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle 401 - try to refresh token
    if (response.status === 401 && retry && accessToken) {
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        // Retry the request with new token
        return this.request<T>(endpoint, options, false)
      }
      // Refresh failed - clear tokens and throw error
      clearTokens()
      throw new Error("Session expired. Please login again.")
    }

    // Handle other errors
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(error.detail)
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value))
      })
      url = `${endpoint}?${searchParams.toString()}`
    }
    return this.request<T>(url, { method: "GET" })
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // POST with FormData (for file uploads)
  async postForm<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: formData,
    })
  }

  // PATCH request
  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  // PATCH with FormData (for file uploads)
  async patchForm<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: formData,
    })
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

// Export singleton instance
export const api = new ApiClient(API_URL)
