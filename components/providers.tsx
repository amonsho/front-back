"use client"

import { GoogleOAuthProvider } from "@react-oauth/google"
import { AuthProvider } from "@/lib/hooks/use-auth"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId="58499815257-98i9t574a6sqhle6g7dagi56h3mrf8eh.apps.googleusercontent.com">
      <AuthProvider>
        {children}
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}
