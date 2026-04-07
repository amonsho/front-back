"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import { handleGoogleCallback } from "@/lib/api/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

interface CallbackPageProps {
  params: Promise<{ locale: string }>
}

export default function CallbackPage({ params }: CallbackPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser } = useAuth()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get("code")
      const { locale } = await params

      if (!code) {
        setStatus("error")
        setError("No authorization code received")
        return
      }

      try {
        await handleGoogleCallback(code)
        await refreshUser()
        setStatus("success")
        toast.success("Successfully signed in with Google!")
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push(`/${locale}`)
        }, 1500)
      } catch (err) {
        setStatus("error")
        setError(err instanceof Error ? err.message : "Google login failed")
        toast.error("Google login failed")
      }
    }

    processCallback()
  }, [searchParams, router, refreshUser, params])

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            {status === "loading" && (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="h-8 w-8 text-destructive" />
            )}
          </div>
          <CardTitle>
            {status === "loading" && "Signing you in..."}
            {status === "success" && "Success!"}
            {status === "error" && "Authentication Failed"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we complete your sign in."}
            {status === "success" && "You have been signed in. Redirecting..."}
            {status === "error" && error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "error" && (
            <button
              onClick={() => router.back()}
              className="w-full text-center text-sm text-primary hover:underline"
            >
              Go back and try again
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
