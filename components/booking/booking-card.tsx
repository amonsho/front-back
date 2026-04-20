"use client"

import { format, differenceInDays } from "date-fns"
import { useTranslations } from "next-intl"
import type { Booking } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, MapPin, Bed, Trash2, CreditCard, Users, Clock, CheckCircle2, XCircle } from "lucide-react"

interface BookingCardProps {
  booking: Booking
  onCancel: (id: number) => void
  onPay?: (booking: Booking) => void
  isDeleting?: boolean
}

export function BookingCard({ booking, onCancel, onPay, isDeleting }: BookingCardProps) {
  const t = useTranslations("myBookings")

  const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    pending: {
      color: "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200",
      icon: <Clock className="w-3.5 h-3.5 mr-1" />,
      label: t("pending"),
    },
    confirmed: {
      color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200",
      icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
      label: t("confirmed"),
    },
    cancelled: {
      color: "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border-red-200",
      icon: <XCircle className="w-3.5 h-3.5 mr-1" />,
      label: t("cancelled"),
    },
  }

  const currentStatus = statusConfig[booking.status] || statusConfig.pending

  const nights =
    booking.date_from && booking.date_to
      ? Math.max(0, differenceInDays(new Date(booking.date_to), new Date(booking.date_from)))
      : 0
      
  const hotel = booking.hotel || booking.room?.hotel

  return (
    <div className="card-premium overflow-hidden flex flex-col sm:flex-row group transition-all duration-300">
      {/* Боковая цветовая полоска статуса */}
      <div
        className={`w-full sm:w-2 h-2 sm:h-auto shrink-0 ${
          booking.status === "confirmed"
            ? "bg-emerald-500"
            : booking.status === "cancelled"
            ? "bg-red-500"
            : "bg-amber-400"
        }`}
      />

      <div className="flex flex-1 flex-col sm:flex-row p-5 sm:p-6 gap-6 justify-between">
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-xl font-extrabold text-foreground mb-1 group-hover:text-primary transition-colors">
                {hotel?.name || "Отель неизвестен"}
              </h3>
              {hotel && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  {hotel.city}, {hotel.country}
                </div>
              )}
            </div>
            <Badge variant="outline" className={`${currentStatus.color} px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg`}>
              {currentStatus.icon} {currentStatus.label}
            </Badge>
          </div>

          {/* Инфо о номере */}
          <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Bed className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">
                {booking.room?.room_type || `Номер #${booking.room_id}`}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span className="font-medium text-foreground">
                  {format(new Date(booking.date_from), "dd MMM yyyy")}
                  {" "}—{" "}
                  {format(new Date(booking.date_to), "dd MMM yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 shrink-0" />
                <span className="font-medium text-foreground">
                  {booking.guests} {booking.guests === 1 ? "гость" : "гостей"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                <span className="font-medium text-foreground">
                  {nights} {nights === 1 ? "ночь" : "ночей"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Правая часть с ценой и кнопками */}
        <div className="flex flex-col items-end justify-between min-w-[160px] pl-4 sm:border-l border-border/50">
          <div className="text-right mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">К оплате</p>
            {booking.total_price != null ? (
              <p className="text-3xl font-extrabold text-foreground">${booking.total_price}</p>
            ) : (
              <p className="text-sm font-medium text-muted-foreground italic">Цена уточняется</p>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full mt-auto">
            {/* Кнопка оплаты для ожидающих броней */}
            {booking.status === "pending" && onPay && (
              <Button
                onClick={() => onPay(booking)}
                className="w-full rounded-xl gap-2 font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md text-sm"
              >
                <CreditCard className="h-4 w-4 shrink-0" />
                Оплатить сейчас
              </Button>
            )}

            {/* Кнопка отмены */}
            {booking.status !== "cancelled" && (
              <Button
                variant="outline"
                onClick={() => onCancel(booking.id)}
                disabled={isDeleting}
                className="w-full rounded-xl gap-2 font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900/30 text-sm"
              >
                <Trash2 className="h-4 w-4 shrink-0" />
                Отменить
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
