"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import useSWR from "swr"
import { useAuth } from "@/lib/hooks/use-auth"
import { getMyBookings, cancelBooking } from "@/lib/api/bookings"
import { createPayment } from "@/lib/api/admin"
import { BookingCard } from "@/components/booking/booking-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { CalendarDays, Loader2, ArrowRight } from "lucide-react"
import type { Booking } from "@/lib/types"

export default function BookingsPage() {
  const t = useTranslations("myBookings")
  const { user, isLoading: authLoading } = useAuth()
  const [cancelId, setCancelId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [payingId, setPayingId] = useState<number | null>(null)

  const { data: bookings, isLoading, mutate } = useSWR(
    user ? "my-bookings" : null,
    () => getMyBookings()
  )

  const handleCancel = async () => {
    if (!cancelId) return

    setIsDeleting(true)
    try {
      const result = await cancelBooking(cancelId)
      if (result.status === "already cancelled") {
        toast.info("Это бронирование уже отменено")
      } else if (result.refund === "success") {
        toast.success("Бронирование отменено, средства возвращены")
      } else {
        toast.success("Бронирование успешно отменено")
      }
      mutate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка отмены бронирования")
    } finally {
      setIsDeleting(false)
      setCancelId(null)
    }
  }

  const handlePay = async (booking: Booking) => {
    if (!booking.total_price) {
      toast.error("Невозможно оплатить: цена не найдена")
      return
    }
    setPayingId(booking.id)
    try {
      const result = await createPayment(booking.id, booking.total_price)
      if (result.checkout_url) {
        window.location.href = result.checkout_url
      } else {
        toast.error("Платежная сессия не получена")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка оплаты")
    } finally {
      setPayingId(null)
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
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg mb-4">Пожалуйста, войдите в систему для просмотра бронирований</p>
        <Button asChild className="rounded-xl h-11 px-8 font-semibold">
          <Link href="/ru/auth/login">Войти</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">Информация о ваших поездках и платежах</p>
      </div>

      {isLoading ? (
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <div className="card-premium flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 mb-5">
            <CalendarDays className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">{t("noBookings")}</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Изучите наши лучшие предложения и забронируйте свой следующий отпуск
          </p>
          <Button asChild className="rounded-xl h-11 px-8 font-semibold shadow-sm">
            <Link href="/ru/hotels">Найти отели <ArrowRight className="ml-2 h-4 w-4"/></Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={(id) => setCancelId(id)}
              onPay={handlePay}
              isDeleting={isDeleting && cancelId === booking.id}
            />
          ))}
        </div>
      )}

      {payingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-border/50 bg-card p-10 shadow-2xl">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-semibold text-foreground">Переходим к оплате...</p>
          </div>
        </div>
      )}

      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent className="rounded-2xl border-border/50 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancelBooking")}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground mt-2">
              {t("cancelConfirm")} Если вы уже оплатили бронирование, возврат средств будет инициирован автоматически.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="rounded-xl font-medium">Вернуться</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="rounded-xl font-medium bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Да, отменить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
