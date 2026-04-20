"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import type { Room } from "@/lib/types"
import { getImageUrl } from "@/lib/api/config"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Wifi, Bed, Users, CheckCircle2, XCircle,
  Coffee, Tv, Wind, Image as ImageIcon,
  X, ChevronLeft, ChevronRight, ZoomIn,
} from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface RoomCardProps {
  room: Room
  onBook: (room: Room) => void
}

export function RoomCard({ room, onBook }: RoomCardProps) {
  const t = useTranslations("hotelDetails")
  const tHotels = useTranslations("hotels")

  // Лайтбокс-стейт
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const amenities = [
    { icon: Wifi, label: "Wi-Fi", active: room.wifi },
    { icon: Coffee, label: "Завтрак", active: true },
    { icon: Tv, label: "ТВ", active: true },
    { icon: Wind, label: "Кондиционер", active: true },
  ]

  const isAvailable = room.is_available !== false
  const photos = room.photos ?? []

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => setLightboxOpen(false)

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLightboxIndex((i) => (i - 1 + photos.length) % photos.length)
  }

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLightboxIndex((i) => (i + 1) % photos.length)
  }

  return (
    <>
      <div className={`card-premium overflow-hidden transition-all ${!isAvailable ? "opacity-60" : ""}`}>
        <div className="flex flex-col sm:flex-row">
          {/* === Фото Галерея === */}
          <div className="relative w-full sm:w-80 shrink-0 overflow-hidden group bg-muted/30" style={{ aspectRatio: "4/3" }}>
            {photos.length > 0 ? (
              <>
                {/* Основное фото (кликабельное) */}
                <button
                  type="button"
                  onClick={() => openLightbox(0)}
                  className="absolute inset-0 w-full h-full cursor-zoom-in"
                  aria-label="Открыть галерею фото"
                >
                  <img
                    src={getImageUrl(photos[0], "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80")}
                    alt={`${room.room_type} - фото 1`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="eager"
                  />
                </button>

                {/* Иконка зума + счётчик */}
                <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none">
                  <div />
                  <div className="flex items-center justify-between">
                    {photos.length > 1 && (
                      <div className="flex gap-1">
                        {photos.slice(1, 4).map((photo, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => openLightbox(i + 1)}
                            className="pointer-events-auto h-10 w-10 rounded-md overflow-hidden border-2 border-white/60 hover:border-white transition-all shadow-md"
                            aria-label={`Фото ${i + 2}`}
                          >
                            <img
                              src={getImageUrl(photo, "")}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                        {photos.length > 4 && (
                          <button
                            type="button"
                            onClick={() => openLightbox(4)}
                            className="pointer-events-auto h-10 w-10 rounded-md border-2 border-white/60 bg-black/50 text-white text-[11px] font-bold flex items-center justify-center backdrop-blur-sm"
                          >
                            +{photos.length - 4}
                          </button>
                        )}
                      </div>
                    )}
                    <div className="pointer-events-auto ml-auto flex items-center gap-1 bg-black/50 backdrop-blur-md text-[10px] text-white px-2 py-0.5 rounded-full font-medium">
                      <ZoomIn className="h-3 w-3" />
                      {photos.length} фото
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-muted flex flex-col items-center justify-center gap-2">
                <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                <span className="text-xs text-muted-foreground/50">Нет фото</span>
              </div>
            )}

            {/* Оверлей статуса «Занято» */}
            {!isAvailable && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                <span className="text-white text-xs font-bold bg-red-600 px-3 py-1 rounded-full shadow-lg">
                  Занято
                </span>
              </div>
            )}
          </div>

          {/* === Контент === */}
          <div className="flex flex-1 flex-col p-4">
            {/* Заголовок */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-foreground">{room.room_type}</h3>
                  <Badge
                    variant={isAvailable ? "default" : "secondary"}
                    className={`text-[10px] px-2 py-0 font-semibold ${
                      isAvailable
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200"
                        : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200"
                    }`}
                  >
                    {isAvailable ? (
                      <><CheckCircle2 className="h-2.5 w-2.5 mr-0.5 inline" />Свободно</>
                    ) : (
                      <><XCircle className="h-2.5 w-2.5 mr-0.5 inline" />Занято</>
                    )}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Bed className="h-3.5 w-3.5" />
                    Номер {room.number_room}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    до 2 гостей
                  </span>
                </div>
              </div>
            </div>

            {/* Удобства */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {amenities.map(({ icon: Icon, label, active }) => (
                <div
                  key={label}
                  className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${
                    active
                      ? "bg-primary/8 text-primary"
                      : "bg-muted text-muted-foreground/50 line-through"
                  }`}
                >
                  <Icon className="h-2.5 w-2.5" />
                  {label}
                </div>
              ))}
            </div>

            {/* Нижняя часть */}
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-foreground">${room.price}</span>
                  <span className="text-xs text-muted-foreground">/ {tHotels("perNight")}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">включая налоги</p>
              </div>
              <Button
                onClick={() => onBook(room)}
                disabled={!isAvailable}
                className="rounded-xl px-5 font-semibold"
                size="default"
              >
                {t("bookNow")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ====== ЛАЙТБОКС ====== */}
      {lightboxOpen && photos.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Кнопка закрытия */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Счётчик */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white text-sm px-4 py-1 rounded-full backdrop-blur-sm">
            {lightboxIndex + 1} / {photos.length}
          </div>

          {/* Кнопка назад */}
          {photos.length > 1 && (
            <button
              onClick={prevPhoto}
              className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Главное изображение */}
          <div
            className="relative max-h-[85vh] max-w-[90vw] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              key={lightboxIndex}
              src={getImageUrl(photos[lightboxIndex], "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=90")}
              alt={`${room.room_type} - фото ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
              style={{ animation: "fadeIn 0.2s ease" }}
            />
          </div>

          {/* Кнопка вперёд */}
          {photos.length > 1 && (
            <button
              onClick={nextPhoto}
              className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Следующее фото"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Миниатюры внизу */}
          {photos.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-1 px-2"
              onClick={(e) => e.stopPropagation()}
            >
              {photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className={`shrink-0 h-14 w-14 rounded-lg overflow-hidden border-2 transition-all ${
                    i === lightboxIndex
                      ? "border-white scale-110 shadow-lg"
                      : "border-white/30 opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`Фото ${i + 1}`}
                >
                  <img
                    src={getImageUrl(photo, "")}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CSS-анимация для лайтбокса */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  )
}
