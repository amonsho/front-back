"use client"

import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "next-intl"
import type { Hotel } from "@/lib/types"
import { getImageUrl } from "@/lib/api/config"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Heart, Wifi, Coffee, Car } from "lucide-react"
import { useState } from "react"

interface HotelCardProps {
  hotel: Hotel
  locale: string
}

export function HotelCard({ hotel, locale }: HotelCardProps) {
  const t = useTranslations("hotels")
  const [liked, setLiked] = useState(false)

  // Псевдо-рейтинг на основе ID
  const rating = (8.2 + (hotel.id % 10) * 0.17).toFixed(1)
  const reviews = 120 + hotel.id * 73
  const priceFrom = 89 + hotel.id * 31

  const getRatingLabel = (r: number) => {
    if (r >= 9) return { text: "Превосходно", color: "bg-emerald-600" }
    if (r >= 8.5) return { text: "Отлично", color: "bg-emerald-500" }
    if (r >= 8) return { text: "Очень хорошо", color: "bg-blue-600" }
    return { text: "Хорошо", color: "bg-blue-500" }
  }

  const ratingNum = parseFloat(rating)
  const ratingLabel = getRatingLabel(ratingNum)

  return (
    <div className="group card-premium overflow-hidden flex flex-col">
      {/* Изображение */}
      <div className="relative aspect-[4/3] overflow-hidden shrink-0">
        <img
          src={getImageUrl(hotel.photo, "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80")}
          alt={hotel.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="eager"
        />
        {/* Оверлей при ховере */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Кнопка лайк */}
        <button
          onClick={(e) => { e.preventDefault(); setLiked(!liked) }}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all hover:scale-110 z-10"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-gray-600"}`}
          />
        </button>

        {/* Значок доступности */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 shadow-md">
            ✓ Свободно
          </Badge>
        </div>
      </div>

      {/* Контент */}
      <div className="flex flex-col flex-1 p-4">
        {/* Название и рейтинг */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors text-[15px]">
              {hotel.name}
            </h3>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{hotel.city}, {hotel.country}</span>
            </div>
          </div>

          {/* Рейтинг-блок */}
          <div className="shrink-0 flex flex-col items-end gap-0.5">
            <div className={`${ratingLabel.color} text-white text-xs font-bold px-2 py-0.5 rounded-lg`}>
              {rating}
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{ratingLabel.text}</span>
          </div>
        </div>

        {/* Описание */}
        {hotel.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {hotel.description}
          </p>
        )}

        {/* Удобства */}
        <div className="flex items-center gap-2 mb-3">
          {[
            { icon: Wifi, label: "Wi-Fi" },
            { icon: Coffee, label: "Завтрак" },
            { icon: Car, label: "Парковка" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
              <Icon className="h-2.5 w-2.5" />
              {label}
            </div>
          ))}
        </div>

        {/* Нижняя часть: цена + кнопка */}
        <div className="flex items-end justify-between mt-auto pt-3 border-t border-border/50">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-muted-foreground">от</span>
              <span className="text-lg font-extrabold text-foreground">${priceFrom}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">за ночь • {reviews} отзывов</span>
          </div>
          <Button
            asChild
            size="sm"
            className="rounded-xl h-8 px-4 text-xs font-semibold shrink-0"
          >
            <Link href={`/${locale}/hotels/${hotel.id}`}>{t("viewDetails")}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
