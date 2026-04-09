"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useAuth } from "@/lib/hooks/use-auth"
import { updateProfile, uploadAvatar } from "@/lib/api/users"
import { profileSchema, type ProfileFormData } from "@/lib/validations/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getImageUrl, API_URL } from "@/lib/api/config"
import { getAccessToken } from "@/lib/api/client"
import { toast } from "sonner"
import { Loader2, Upload, User, CheckCircle2, ShieldCheck, ShieldAlert, Mail } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ProfilePage() {
  const t = useTranslations("profile")
  const { user, profile, isLoading: authLoading, refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
      })
    }
  }, [profile, reset])

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      await updateProfile(data)
      await refreshUser()
      toast.success(t("profileUpdated"))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      await uploadAvatar(file)
      await refreshUser()
      toast.success("Avatar uploaded successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload avatar")
    } finally {
      setIsUploading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Please sign in to view your profile</p>
      </div>
    )
  }

  const initials = user.name?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase() || "U"

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">{t("title")}</h1>

      {/* Avatar Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("avatar")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={getImageUrl(user.avatar)} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <Label
              htmlFor="avatar-upload"
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {t("uploadAvatar")}
            </Label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={isUploading}
            />
            <p className="mt-2 text-sm text-muted-foreground">
              JPG, PNG or GIF. Max 2MB.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Name</Label>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Email</Label>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Role</Label>
            <p className="font-medium capitalize">{user.role}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Verification Status</Label>
            <div className="mt-1 flex items-center gap-2">
              {user.is_verified ? (
                <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                  <ShieldCheck className="mr-1 h-3 w-3" /> Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <ShieldAlert className="mr-1 h-3 w-3" /> Not Verified
                </Badge>
              )}
            </div>
          </div>
          {!user.is_verified && (
            <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
              <Mail className="h-4 w-4 text-yellow-700" />
              <AlertTitle>Action Required</AlertTitle>
              <AlertDescription>
                Please check your email <strong>{user.email}</strong> to verify your account and unlock all features.
              </AlertDescription>
            </Alert>
          )}
          <div>
            <Label className="text-muted-foreground">Google Account</Label>
            {user.google_id ? (
              <div className="mt-1 flex items-center gap-2 font-medium text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Connected
              </div>
            ) : (
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const token = getAccessToken()
                    if (!token) {
                      toast.error("Session expired. Please login again.")
                      return
                    }
                    // Pass the token as a query param so the backend can authenticate the GET request
                    window.location.href = `${API_URL}/auth/google/link?token=${token}`
                  }}
                  className="gap-2"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Connect Google Account
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">{t("firstName")}</Label>
                <Input id="first_name" {...register("first_name")} />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">{t("lastName")}</Label>
                <Input id="last_name" {...register("last_name")} />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input id="phone" type="tel" {...register("phone")} />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("updateProfile")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
