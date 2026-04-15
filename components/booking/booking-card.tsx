"use client"

import { format } from "date-fns"
import { useTranslations } from "next-intl"
import type { Booking } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, MapPin, Bed, Trash2, CreditCard, Users } from "lucide-react"

interface BookingCardProps {
  booking: Booking
  onCancel: (id: number) => void
  onPay?: (booking: Booking) => void
  isDeleting?: boolean
}

export function BookingCard({ booking, onCancel, onPay, isDeleting }: BookingCardProps) {
  const t = useTranslations("myBookings")

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  }

  const statusLabels: Record<string, string> = {
    pending: t("pending"),
    confirmed: t("confirmed"),
    cancelled: t("cancelled"),
  }

  const nights =
    booking.date_from && booking.date_to
      ? Math.max(
          0,
          Math.round(
            (new Date(booking.date_to).getTime() -
              new Date(booking.date_from).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col gap-0 sm:flex-row">
          {/* Status bar */}
          <div
            className={`w-full sm:w-1.5 ${
              booking.status === "confirmed"
                ? "bg-green-500"
                : booking.status === "cancelled"
                ? "bg-red-400"
                : "bg-yellow-400"
            }`}
          />

          <div className="flex flex-1 flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold">
                  {booking.room?.room_type || `Room #${booking.room_id}`}
                </h3>
                <Badge className={statusColors[booking.status] ?? ""}>
                  {statusLabels[booking.status] ?? booking.status}
                </Badge>
              </div>

              {booking.hotel && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {booking.hotel.name} — {booking.hotel.city}
                </div>
              )}

              {booking.room && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Bed className="h-4 w-4 shrink-0" />
                  {booking.room.room_type}
                  {booking.room.wifi ? " · WiFi" : ""}
                  {booking.room.is_available === false ? (
                    <span className="ml-1 text-xs text-red-500">Unavailable</span>
                  ) : null}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(booking.date_from), "MMM d, yyyy")} →{" "}
                    {format(new Date(booking.date_to), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                </div>
                {nights > 0 && (
                  <span className="text-muted-foreground">{nights} nights</span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 min-w-[140px]">
              <div className="text-right">
                {booking.total_price != null ? (
                  <>
                    <p className="text-2xl font-bold">${booking.total_price}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Price TBD</p>
                )}
              </div>

              {/* Pay Now button — only for pending bookings */}
              {booking.status === "pending" && onPay && (
                <Button
                  size="sm"
                  onClick={() => onPay(booking)}
                  className="gap-1 w-full"
                >
                  <CreditCard className="h-4 w-4" />
                  Pay Now
                </Button>
              )}

              {/* Cancel button — not for already cancelled */}
              {booking.status !== "cancelled" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(booking.id)}
                  disabled={isDeleting}
                  className="gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground w-full"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("cancelBooking")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
