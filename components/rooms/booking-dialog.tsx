"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { format, differenceInDays, addDays } from "date-fns"
import type { Room, Hotel } from "@/lib/types"
import { createBooking } from "@/lib/api/bookings"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookingDialogProps {
  room: Room | null
  hotel: Hotel | null
  locale: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookingDialog({ room, hotel, locale, open, onOpenChange }: BookingDialogProps) {
  const t = useTranslations("booking")
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const [checkIn, setCheckIn] = useState<Date | undefined>(addDays(new Date(), 1))
  const [checkOut, setCheckOut] = useState<Date | undefined>(addDays(new Date(), 3))
  const [isLoading, setIsLoading] = useState(false)

  if (!room || !hotel) return null

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0
  const totalPrice = nights * room.price

  const handleBook = async () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to book a room")
      router.push(`/${locale}/auth/login`)
      return
    }

    if (!checkIn || !checkOut) {
      toast.error(t("selectDates"))
      return
    }

    if (checkOut <= checkIn) {
      toast.error(t("invalidDates"))
      return
    }

    setIsLoading(true)
    try {
      await createBooking({
        room_id: room.id,
        date_from: format(checkIn, "yyyy-MM-dd"),
        date_to: format(checkOut, "yyyy-MM-dd"),
        guests: 1, // Defaulting to 1 for now
      })
      toast.success(t("bookingSuccess"))
      onOpenChange(false)
      router.push(`/${locale}/profile/bookings`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Booking failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {room.room_type} at {hotel.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Check-in Date */}
          <div className="space-y-2">
            <Label>{t("checkIn")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !checkIn && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkIn ? format(checkIn, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={setCheckIn}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Check-out Date */}
          <div className="space-y-2">
            <Label>{t("checkOut")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !checkOut && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkOut ? format(checkOut, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkOut}
                  onSelect={setCheckOut}
                  disabled={(date) => date <= (checkIn || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Price Summary */}
          {nights > 0 && (
            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between text-sm">
                <span>
                  ${room.price} x {nights} nights
                </span>
                <span>${totalPrice}</span>
              </div>
              <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
                <span>{t("totalPrice")}</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleBook} disabled={isLoading || nights <= 0}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("confirmBooking")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
