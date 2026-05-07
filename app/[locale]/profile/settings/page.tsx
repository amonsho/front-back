"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useAuth } from "@/lib/hooks/use-auth"
import { changePassword, updateProfile } from "@/lib/api/users"
import { changePasswordSchema, profileSchema, type ChangePasswordFormData, type ProfileFormData } from "@/lib/validations/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Lock, User as UserIcon } from "lucide-react"

export default function SettingsPage() {
  const t = useTranslations("profile")
  const { user, profile, isLoading: authLoading, refreshUser } = useAuth()
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [isProfileLoading, setIsProfileLoading] = useState(false)

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      phone: profile?.phone || "",
    }
  })

  // Populate form with data when profile is loaded
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
      })
    }
  }, [profile, profileForm])

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setIsPasswordLoading(true)
    try {
      await changePassword(data.currentPassword, data.newPassword, data.confirmPassword)
      toast.success(t("passwordChanged"))
      passwordForm.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to change password")
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsProfileLoading(true)
    try {
      await updateProfile(data)
      await refreshUser()
      toast.success(t("profileUpdated"))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsProfileLoading(false)
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
        <p className="text-muted-foreground">Please sign in to view settings</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold">{t("settings")}</h1>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Личная информация
          </CardTitle>
          <CardDescription>
            Обновите вашу персональную информацию
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">{t("firstName")}</Label>
                <Input id="first_name" {...profileForm.register("first_name")} />
                {profileForm.formState.errors.first_name && (
                  <p className="text-sm text-destructive">{profileForm.formState.errors.first_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">{t("lastName")}</Label>
                <Input id="last_name" {...profileForm.register("last_name")} />
                {profileForm.formState.errors.last_name && (
                  <p className="text-sm text-destructive">{profileForm.formState.errors.last_name.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input id="phone" type="tel" {...profileForm.register("phone")} />
              {profileForm.formState.errors.phone && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.phone.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isProfileLoading}>
              {isProfileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("updateProfile")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {t("changePassword")}
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...passwordForm.register("currentPassword")}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("newPassword")}</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...passwordForm.register("newPassword")}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmNewPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...passwordForm.register("confirmPassword")}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isPasswordLoading}>
              {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("changePassword")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
