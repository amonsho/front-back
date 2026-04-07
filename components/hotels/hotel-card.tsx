"use client"

import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "next-intl"
import type { Hotel } from "@/lib/types"
import { getImageUrl } from "@/lib/api/config"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star } from "lucide-react"

interface HotelCardProps {
  hotel: Hotel
  locale: string
}

export function HotelCard({ hotel, locale }: HotelCardProps) {
  const t = useTranslations("hotels")

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={getImageUrl(hotel.photo)}
          alt={hotel.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="line-clamp-1 text-lg font-semibold">{hotel.name}</h3>
        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">
            {hotel.city}
          </span>
        </div>
        {hotel.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {hotel.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/${locale}/hotels/${hotel.id}`}>{t("viewDetails")}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
