"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { verifyEmail } from "@/lib/api/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from "lucide-react"
import Link from "next/link"

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Verification token is missing.")
      return
    }

    const performVerification = async () => {
      try {
        const response = await verifyEmail(token)
        setStatus("success")
        setMessage(response.message || "Your email has been successfully verified!")
      } catch (error: any) {
        setStatus("error")
        setMessage(error.message || "Verification failed. The link may be invalid or expired.")
      }
    }

    performVerification()
  }, [token])

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-10">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {status === "loading" && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
            {status === "success" && <CheckCircle2 className="h-8 w-8 text-green-600" />}
            {status === "error" && <XCircle className="h-8 w-8 text-destructive" />}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Verifying your email..."}
            {status === "success" && "Account Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we confirm your account."}
            {status === "success" && "You can now access all features of our platform."}
            {status === "error" && "We couldn't verify your account."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className={`text-sm ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}>
            {message}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          {status === "success" ? (
            <Button asChild className="w-full">
              <Link href="/profile">Go to Profile</Link>
            </Button>
          ) : status === "error" ? (
            <div className="flex w-full flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/auth/login">Try Logging In</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="container flex min-h-[60vh] items-center justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
