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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getImageUrl, API_URL } from "@/lib/api/config"
import { getAccessToken } from "@/lib/api/client"
import { toast } from "sonner"
import { Loader2, Upload, User, CheckCircle2, ShieldCheck, ShieldAlert, Mail, Camera } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg mb-4">Пожалуйста, войдите в систему</p>
      </div>
    )
  }

  const initials = user.name?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase() || "U"

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">Управляйте своими личными данными и настройками</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 md:items-start">
        {/* Левая колонка — Аватар и статус */}
        <div className="md:col-span-1 space-y-6">
          <div className="card-premium p-6 flex flex-col items-center text-center">
            <div className="relative mb-4 group">
              <Avatar className="h-28 w-28 ring-4 ring-background shadow-xl">
                <AvatarImage src={getImageUrl(user.avatar)} className="object-cover" />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-blue-700 text-white font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploading} />
              </Label>
            </div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground truncate w-full mb-3">{user.email}</p>
            <div className="flex justify-center w-full">
              {user.is_verified ? (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 gap-1 rounded-xl">
                  <ShieldCheck className="h-3.5 w-3.5" /> Подтвержден
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 gap-1 rounded-xl">
                  <ShieldAlert className="h-3.5 w-3.5" /> Не подтвержден
                </Badge>
              )}
            </div>
            {!user.is_verified && (
              <div className="mt-4 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-500 text-xs p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 flex flex-col gap-2">
                 <div className="flex items-center gap-1.5 font-bold">
                   <Mail className="h-3.5 w-3.5" /> Требуется действие
                 </div>
                 <p className="leading-relaxed">Подтвердите email <strong>{user.email}</strong>, чтобы получить доступ ко всем функциям.</p>
              </div>
            )}
          </div>
        </div>

        {/* Правая колонка — Формы */}
        <div className="md:col-span-2 space-y-6">
          <div className="card-premium p-6 sm:p-8">
            <div className="mb-6 border-b border-border/50 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Личная информация
              </h2>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("firstName")}</Label>
                  <Input id="first_name" {...register("first_name")} className="h-11 rounded-xl" />
                  {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("lastName")}</Label>
                  <Input id="last_name" {...register("last_name")} className="h-11 rounded-xl" />
                  {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("phone")}</Label>
                <Input id="phone" type="tel" {...register("phone")} className="h-11 rounded-xl" />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
              
              <div className="pt-2">
                <Button type="submit" disabled={isLoading} className="h-11 rounded-xl px-8 font-semibold shadow-sm w-full sm:w-auto">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("updateProfile")}
                </Button>
              </div>
            </form>
          </div>

          <div className="card-premium p-6 sm:p-8">
            <div className="mb-6 border-b border-border/50 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google Аккаунт
              </h2>
            </div>
            
            {user.google_id ? (
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Привязан</p>
                    <p className="text-xs text-muted-foreground">Вы можете входить в один клик</p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Привяжите Google аккаунт для быстрого входа без пароля.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    const token = getAccessToken()
                    if (!token) {
                      toast.error("Срок действия сессии истек. Войдите снова.")
                      return
                    }
                    window.location.href = `${API_URL}/auth/google/link?token=${token}`
                  }}
                  className="h-11 rounded-xl w-full sm:w-auto font-semibold gap-2 border-border/60 hover:bg-muted"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Привязать Google
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
