"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import useSWR from "swr"
import { useAuth } from "@/lib/hooks/use-auth"
import { getMyBookings, cancelBooking } from "@/lib/api/bookings"
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

// Demo bookings
const demoBookings: Booking[] = [
  {
    id: 1,
    user_id: 1,
    room_id: 1,
    date_from: "2024-03-15",
    date_to: "2024-03-18",
    total_price: 750,
    status: "confirmed",
    guests: 2,
    created_at: "2024-02-20",
    room: {
      id: 1,
      hotel_id: 1,
      room_type: "Deluxe",
      price: 250,
      wifi: true,
      photo: null,
    },
    hotel: {
      id: 1,
      name: "Grand Plaza Hotel",
      city: "New York",
      address: "123 Fifth Avenue",
    },
  },
  {
    id: 2,
    user_id: 1,
    room_id: 2,
    date_from: "2024-04-01",
    date_to: "2024-04-05",
    total_price: 720,
    status: "pending",
    guests: 2,
    created_at: "2024-02-25",
    room: {
      id: 2,
      hotel_id: 2,
      room_type: "Suite",
      price: 180,
      wifi: true,
      photo: null,
    },
    hotel: {
      id: 2,
      name: "Seaside Resort",
      city: "Miami",
      address: "456 Ocean Drive",
    },
  },
]

export default function BookingsPage() {
  const t = useTranslations("myBookings")
  const { user, isLoading: authLoading } = useAuth()
  const [cancelId, setCancelId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: bookings, isLoading, mutate } = useSWR(
    user ? "my-bookings" : null,
    () => getMyBookings(),
    { fallbackData: demoBookings }
  )

  const handleCancel = async () => {
    if (!cancelId) return

    setIsDeleting(true)
    try {
      await cancelBooking(cancelId)
      toast.success("Booking cancelled successfully")
      mutate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel booking")
    } finally {
      setIsDeleting(false)
      setCancelId(null)
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
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">{t("title")}</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
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
              isDeleting={isDeleting && cancelId === booking.id}
            />
          ))}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancelBooking")}</AlertDialogTitle>
            <AlertDialogDescription>{t("cancelConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
