"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import type { Room } from "@/lib/types"
import { getImageUrl } from "@/lib/api/config"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wifi, Bed } from "lucide-react"

interface RoomCardProps {
  room: Room
  onBook: (room: Room) => void
}

export function RoomCard({ room, onBook }: RoomCardProps) {
  const t = useTranslations("hotelDetails")
  const tHotels = useTranslations("hotels")

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="relative aspect-video w-full sm:aspect-square sm:w-48">
          <Image
            src={getImageUrl(room.photo, "/placeholder-room.jpg")}
            alt={room.room_type}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col">
          <CardContent className="flex-1 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{room.room_type}</h3>
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    {room.room_type}
                  </span>
                  {room.wifi && (
                    <span className="flex items-center gap-1 text-green-600">
                      <Wifi className="h-4 w-4" />
                      Free WiFi
                    </span>
                  )}
                </div>
              </div>
            </div>
            {room.description && (
              <p className="mt-2 text-sm text-muted-foreground">{room.description}</p>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t p-4">
            <div>
              <span className="text-2xl font-bold">${room.price}</span>
              <span className="text-sm text-muted-foreground"> / {tHotels("perNight")}</span>
            </div>
            <Button onClick={() => onBook(room)}>
              {t("bookNow")}
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  )
}
