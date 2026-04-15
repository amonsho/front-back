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
import { CalendarDays, Loader2 } from "lucide-react"
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
        toast.info("This booking was already cancelled")
      } else if (result.refund === "success") {
        toast.success("Booking cancelled and refund initiated")
      } else {
        toast.success("Booking cancelled successfully")
      }
      mutate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel booking")
    } finally {
      setIsDeleting(false)
      setCancelId(null)
    }
  }

  const handlePay = async (booking: Booking) => {
    if (!booking.total_price) {
      toast.error("Cannot process payment: price not available")
      return
    }
    setPayingId(booking.id)
    try {
      const result = await createPayment(booking.id, booking.total_price)
      // Redirect to Stripe checkout
      if (result.checkout_url) {
        window.location.href = result.checkout_url
      } else {
        toast.error("Payment session not received")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment failed")
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
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Please sign in to view your bookings</p>
        <Button asChild className="mt-4">
          <Link href="/en/auth/login">Sign In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">{t("title")}</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">{t("noBookings")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Start exploring hotels and book your next stay
          </p>
          <Button asChild className="mt-4">
            <Link href="/en/hotels">Browse Hotels</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
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
          <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-8 shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Redirecting to payment…</p>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancelBooking")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cancelConfirm")}
              {" "}If payment was made, a refund will be initiated automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
