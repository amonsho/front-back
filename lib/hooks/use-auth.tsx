"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { User, Profile } from "@/lib/types"
import { getCurrentUser, getProfile } from "@/lib/api/users"
import { login as apiLogin, logout as apiLogout, register as apiRegister } from "@/lib/api/auth"
import { isAuthenticated, clearTokens } from "@/lib/api/client"
import type { LoginRequest, RegisterRequest } from "@/lib/types"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isLoggedIn: boolean
  isAdmin: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    if (!isAuthenticated()) {
      setUser(null)
      setProfile(null)
      setIsLoading(false)
      return
    }

    try {
      const [userData, profileData] = await Promise.all([
        getCurrentUser(),
        getProfile().catch(() => null),
      ])
      setUser(userData)
      setProfile(profileData)
    } catch {
      clearTokens()
      setUser(null)
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (data: LoginRequest) => {
    await apiLogin(data)
    await fetchUser()
  }

  const register = async (data: RegisterRequest) => {
    await apiRegister(data)
  }

  const logout = () => {
    apiLogout()
    setUser(null)
    setProfile(null)
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isLoggedIn: !!user,
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
