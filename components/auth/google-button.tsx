"use client"

import { useTranslations, useLocale } from "next-intl"
import { GoogleLogin } from "@react-oauth/google"
import { loginWithGoogleIdToken } from "@/lib/api/auth"
import { useAuth } from "@/lib/hooks/use-auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function GoogleButton() {
  const t = useTranslations("auth")
  const { refreshUser } = useAuth()
  const router = useRouter()
  const locale = useLocale()
  const [loading, setLoading] = useState(false)

  const handleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return
    
    setLoading(true)
    try {
      await loginWithGoogleIdToken(credentialResponse.credential)
      await refreshUser()
      toast.success("Successfully signed in with Google!")
      router.push(`/${locale}`)
    } catch (error) {
      toast.error("Google login failed by backend")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex justify-center mt-2 relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 rounded-md">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error("Google login failed")}
        theme="outline"
      />
    </div>
  )
}
