import { api, saveTokens, clearTokens } from "./client"
import { API_URL } from "./config"
import type { TokenPair, LoginRequest, RegisterRequest, User } from "@/lib/types"

// Login user
export async function login(data: LoginRequest): Promise<TokenPair> {
  // FastAPI OAuth2 expects form data for login
  const formData = new URLSearchParams()
  formData.append("username", data.email)
  formData.append("password", data.password)

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Login failed" }))
    throw new Error(error.detail)
  }

  const tokens: TokenPair = await response.json()
  saveTokens(tokens)
  return tokens
}

// Register user
export async function register(data: RegisterRequest): Promise<User> {
  const user = await api.post<User>("/auth/register", data)
  return user
}

// Logout user
export function logout(): void {
  clearTokens()
}

// Get Google OAuth login URL
export function getGoogleLoginUrl(): string {
  return `${API_URL}/auth/google/register`
}

// Handle Google OAuth callback - exchange code for tokens
export async function handleGoogleCallback(code: string): Promise<TokenPair> {
  const response = await fetch(`${API_URL}/auth/google/callback?code=${code}`)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Google login failed" }))
    throw new Error(error.detail)
  }

  const tokens: TokenPair = await response.json()
  saveTokens(tokens)
  return tokens
}

// Login with Google ID Token (from @react-oauth/google frontend flow)
export async function loginWithGoogleIdToken(idToken: string): Promise<TokenPair> {
  const response = await fetch(`${API_URL}/auth/google/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id_token: idToken }),
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Google login failed" }))
    throw new Error(error.detail)
  }

  const tokens: TokenPair = await response.json()
  saveTokens(tokens)
  return tokens
}

// Verify email with token
export async function verifyEmail(token: string): Promise<{ message: string }> {
  return api.get<{ message: string }>(`/auth/verify?token=${token}`)
}
