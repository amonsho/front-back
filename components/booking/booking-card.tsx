"use client"

import { format } from "date-fns"
import { useTranslations } from "next-intl"
import type { Booking } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, MapPin, Bed, Trash2 } from "lucide-react"

interface BookingCardProps {
  booking: Booking
  onCancel: (id: number) => void
  isDeleting?: boolean
}

export function BookingCard({ booking, onCancel, isDeleting }: BookingCardProps) {
  const t = useTranslations("myBookings")

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }

  const statusLabels = {
    pending: t("pending"),
    confirmed: t("confirmed"),
    cancelled: t("cancelled"),
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{booking.room?.room_type || `Room #${booking.room_id}`}</h3>
              <Badge className={statusColors[booking.status]}>
                {statusLabels[booking.status]}
              </Badge>
            </div>

            {booking.hotel && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {booking.hotel.name} - {booking.hotel.city}
              </div>
            )}

            {booking.room && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Bed className="h-4 w-4" />
                {booking.room.room_type} {booking.room.wifi ? "- WiFi included" : ""}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(booking.date_from), "MMM d, yyyy")} -{" "}
                  {format(new Date(booking.date_to), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-2xl font-bold">${booking.total_price}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            {booking.status !== "cancelled" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(booking.id)}
                disabled={isDeleting}
                className="gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
                {t("cancelBooking")}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
