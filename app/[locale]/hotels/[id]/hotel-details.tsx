"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import useSWR from "swr"
import type { Hotel, Room, Review, HotelReviewsResponse } from "@/lib/types"
import { getHotel } from "@/lib/api/hotels"
import { getRoomsByHotel } from "@/lib/api/rooms"
import { getReviewsByHotel } from "@/lib/api/reviews"
import { getImageUrl } from "@/lib/api/config"
import { RoomCard } from "@/components/rooms/room-card"
import { BookingDialog } from "@/components/rooms/booking-dialog"
import { ReviewCard } from "@/components/reviews/review-card"
import { ReviewForm } from "@/components/reviews/review-form"
import MapWrapper from "@/components/map/MapWrapper"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Star,
  MapPin,
  ArrowLeft,
  Bed,
  MessageSquare,
  Wifi,
  Coffee,
  Car,
  Dumbbell,
  CheckCircle2,
  Share2,
  Heart,
} from "lucide-react"

interface HotelDetailsProps {
  hotelId: number
  locale: string
}

const amenityIcons = [
  { icon: Wifi, label: "Бесплатный Wi-Fi" },
  { icon: Coffee, label: "Завтрак включён" },
  { icon: Car, label: "Парковка" },
  { icon: Dumbbell, label: "Фитнес-центр" },
]

export function HotelDetails({ hotelId, locale }: HotelDetailsProps) {
  const t = useTranslations("hotelDetails")
  const tCommon = useTranslations("common")
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [liked, setLiked] = useState(false)

  const { data: hotel, isLoading: hotelLoading } = useSWR(
    ["hotel", hotelId],
    () => getHotel(hotelId)
  )

  const { data: rooms, isLoading: roomsLoading } = useSWR<Room[]>(
    ["rooms", hotelId],
    () => getRoomsByHotel(hotelId)
  )

  const { data: reviewsData, mutate: mutateReviews } = useSWR<HotelReviewsResponse>(
    ["reviews", hotelId],
    () => getReviewsByHotel(hotelId)
  )

  const reviews: Review[] = reviewsData?.reviews ?? []
  const averageRating: number | null = reviewsData?.average_rating ?? null

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room)
    setBookingOpen(true)
  }

  const getRatingLabel = (r: number) => {
    if (r >= 9) return "Превосходно"
    if (r >= 8.5) return "Отлично"
    if (r >= 8) return "Очень хорошо"
    return "Хорошо"
  }

  if (hotelLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-[50vh] w-full rounded-none" />
        <div className="container mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Отель не найден</p>
        <Button asChild className="rounded-xl">
          <Link href={`/${locale}/hotels`}>{tCommon("back")}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Герой отеля ─── */}
      <div className="relative h-[55vh] min-h-[380px] overflow-hidden">
        <Image
          src={getImageUrl(hotel.photo, "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=85")}
          alt={hotel.name}
          fill
          className="object-cover"
          priority
        />
        {/* Градиент снизу */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Кнопка назад */}
        <div className="absolute top-5 left-5 z-10">
          <Button
            variant="ghost"
            asChild
            className="gap-2 rounded-xl bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm border border-white/20 h-9"
          >
            <Link href={`/${locale}/hotels`}>
              <ArrowLeft className="h-4 w-4" />
              {tCommon("back")}
            </Link>
          </Button>
        </div>

        {/* Кнопки лайк/поделиться */}
        <div className="absolute top-5 right-5 z-10 flex gap-2">
          <button
            onClick={() => setLiked(!liked)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20 transition-all"
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-red-400 text-red-400" : "text-white"}`} />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20 transition-all">
            <Share2 className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Инфо отеля поверх фото */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
          <div className="container mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                {averageRating && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5 bg-emerald-600 text-white text-sm font-bold px-3 py-1 rounded-xl">
                      <Star className="h-3.5 w-3.5 fill-white" />
                      {averageRating.toFixed(1)}
                    </div>
                    <span className="text-white/80 text-sm font-medium">
                      {getRatingLabel(averageRating)} · {reviews.length} отзывов
                    </span>
                  </div>
                )}
                <h1 className="text-3xl font-extrabold text-white tracking-tight md:text-4xl lg:text-5xl">
                  {hotel.name}
                </h1>
                <div className="mt-2 flex items-center gap-1.5 text-white/75">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{hotel.address || hotel.city}, {hotel.country}</span>
                </div>
              </div>

              {/* Удобства в герое */}
              <div className="hidden sm:flex gap-2">
                {amenityIcons.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    title={label}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20"
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Основной контент ─── */}
      <div className="container mx-auto px-4 lg:px-6 py-8">
        <Tabs defaultValue="rooms" className="w-full">
          {/* Таб-бар */}
          <TabsList className="h-auto p-1 rounded-xl bg-muted/60 gap-1 mb-8">
            <TabsTrigger
              value="rooms"
              className="gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Bed className="h-4 w-4" />
              {t("availableRooms")}
              {rooms && (
                <span className="ml-1 text-xs bg-primary/12 text-primary px-1.5 py-0.5 rounded-md font-bold">
                  {rooms.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <MessageSquare className="h-4 w-4" />
              {t("reviews")}
              <span className="ml-1 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">
                {reviews.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* ─── Вкладка: Номера ─── */}
          <TabsContent value="rooms">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Левая колонка */}
              <div className="lg:col-span-2 space-y-6">
                {/* Описание */}
                {hotel.description && (
                  <div className="card-premium p-6">
                    <h2 className="text-lg font-bold mb-3">{t("about")}</h2>
                    <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">
                      {hotel.description}
                    </p>
                  </div>
                )}

                {/* Включено в стоимость */}
                <div className="card-premium p-6">
                  <h2 className="text-lg font-bold mb-4">Удобства отеля</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { icon: Wifi, label: "Бесплатный Wi-Fi" },
                      { icon: Coffee, label: "Ресторан/кафе" },
                      { icon: Car, label: "Парковка" },
                      { icon: Dumbbell, label: "Тренажёрный зал" },
                      { icon: CheckCircle2, label: "Стойка регистрации 24/7" },
                      { icon: CheckCircle2, label: "Кондиционер" },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-2 text-sm text-foreground">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Номера */}
                <div>
                  <h2 className="text-lg font-bold mb-4">{t("availableRooms")}</h2>
                  {roomsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-36 w-full rounded-2xl" />
                      ))}
                    </div>
                  ) : !rooms || rooms.length === 0 ? (
                    <div className="card-premium flex flex-col items-center justify-center py-12 text-center">
                      <Bed className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">{t("noRooms")}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rooms.map((room: Room) => (
                        <RoomCard key={room.id} room={room} onBook={handleBookRoom} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Правая колонка: Карта */}
              <div className="space-y-5">
                <div className="card-premium p-5">
                  <h2 className="text-base font-bold mb-4">{t("location")}</h2>
                  {hotel.latitude && hotel.longitude ? (
                    <div className="h-[280px] overflow-hidden rounded-xl">
                      <MapWrapper
                        latitude={hotel.latitude}
                        longitude={hotel.longitude}
                        hotelName={hotel.name}
                      />
                    </div>
                  ) : (
                    <div className="flex h-[200px] flex-col items-center justify-center rounded-xl bg-muted/40 border-2 border-dashed border-border text-center p-4">
                      <MapPin className="h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-xs text-muted-foreground">Координаты не указаны</p>
                    </div>
                  )}
                  {(hotel.address || hotel.city) && (
                    <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                      <span>{hotel.address || hotel.city}, {hotel.country}</span>
                    </div>
                  )}
                </div>

                {/* Политика */}
                <div className="card-premium p-5">
                  <h3 className="text-base font-bold mb-3">Политика отеля</h3>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Заезд</span>
                      <span className="font-medium text-foreground">с 14:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Выезд</span>
                      <span className="font-medium text-foreground">до 12:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Отмена</span>
                      <span className="font-medium text-emerald-600">Бесплатно</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Домашние животные</span>
                      <span className="font-medium text-foreground">Нет</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ─── Вкладка: Отзывы ─── */}
          <TabsContent value="reviews">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {/* Форма отзыва */}
                <div className="card-premium p-6">
                  <h2 className="text-lg font-bold mb-4">{t("writeReview")}</h2>
                  <ReviewForm hotelId={hotelId} onSuccess={() => mutateReviews()} />
                </div>

                {/* Список отзывов */}
                <div>
                  <h2 className="text-lg font-bold mb-4">
                    {t("reviews")} ({reviews.length})
                  </h2>
                  {!reviews || reviews.length === 0 ? (
                    <div className="card-premium flex flex-col items-center justify-center py-12 text-center">
                      <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">{t("noReviews")}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review: Review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Сводка рейтинга */}
              {averageRating && (
                <div>
                  <div className="card-premium p-6 text-center">
                    <div className="text-6xl font-extrabold text-foreground mb-1">
                      {averageRating.toFixed(1)}
                    </div>
                    <div className="text-sm font-semibold text-emerald-600 mb-1">
                      {getRatingLabel(averageRating)}
                    </div>
                    <div className="flex justify-center gap-0.5 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(averageRating / 2)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      На основе {reviews.length} отзывов
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Диалог бронирования */}
      <BookingDialog
        room={selectedRoom}
        hotel={hotel}
        locale={locale}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
      />
    </div>
  )
}
