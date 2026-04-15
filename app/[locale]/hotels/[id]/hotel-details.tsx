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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, ArrowLeft, Bed, MessageSquare } from "lucide-react"

interface HotelDetailsProps {
  hotelId: number
  locale: string
}

// Demo data
const demoHotel: Hotel = {
  id: 1,
  name: "Grand Plaza Hotel",
  city: "New York",
  country: "USA",
  description:
    "Experience luxury in the heart of Manhattan with stunning city views and world-class amenities. Our hotel offers spacious rooms, fine dining, a rooftop pool, and 24/7 concierge service.",
  address: "123 Fifth Avenue, New York, NY 10010",
  photo: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
}

const demoRooms: Room[] = [
  {
    id: 1,
    hotel_id: 1,
    number_room: 101,
    room_type: "Deluxe",
    price: 250,
    wifi: true,
    photo: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80",
    is_available: true,
  },
  {
    id: 2,
    hotel_id: 1,
    number_room: 201,
    room_type: "Suite",
    price: 450,
    wifi: true,
    photo: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
    is_available: true,
  },
]

const demoReviewsResponse: HotelReviewsResponse = {
  reviews: [
    {
      id: 1,
      user_id: 1,
      hotel_id: 1,
      rating: 5,
      comment: "Amazing hotel! The staff was incredibly friendly and the room was spotless. Would definitely stay again.",
    },
    {
      id: 2,
      user_id: 2,
      hotel_id: 1,
      rating: 4,
      comment: "Great location and beautiful rooms. The only downside was the breakfast could use more variety.",
    },
  ],
  average_rating: 4.5,
}

export function HotelDetails({ hotelId, locale }: HotelDetailsProps) {
  const t = useTranslations("hotelDetails")
  const tCommon = useTranslations("common")
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [bookingOpen, setBookingOpen] = useState(false)

  const { data: hotel, isLoading: hotelLoading } = useSWR(
    ["hotel", hotelId],
    () => getHotel(hotelId),
    { fallbackData: demoHotel }
  )

  const { data: rooms, isLoading: roomsLoading } = useSWR<Room[]>(
    ["rooms", hotelId],
    () => getRoomsByHotel(hotelId),
    { fallbackData: demoRooms }
  )

  const { data: reviewsData, mutate: mutateReviews } = useSWR<HotelReviewsResponse>(
    ["reviews", hotelId],
    () => getReviewsByHotel(hotelId),
    { fallbackData: demoReviewsResponse }
  )

  const reviews: Review[] = reviewsData?.reviews ?? []
  const averageRating: number | null = reviewsData?.average_rating ?? null

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room)
    setBookingOpen(true)
  }

  if (hotelLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-4 h-8 w-32" />
        <Skeleton className="aspect-[2/1] w-full rounded-lg" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Hotel not found</p>
        <Button asChild className="mt-4">
          <Link href={`/${locale}/hotels`}>{tCommon("back")}</Link>
        </Button>
      </div>
    )
  }



  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button variant="ghost" asChild className="mb-4 gap-2">
        <Link href={`/${locale}/hotels`}>
          <ArrowLeft className="h-4 w-4" />
          {tCommon("back")}
        </Link>
      </Button>

      {/* Hero Image */}
      <div className="relative aspect-[2/1] overflow-hidden rounded-lg md:aspect-[3/1]">
        <Image
          src={getImageUrl(hotel.photo)}
          alt={hotel.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <div className="mb-2 flex items-center gap-2">
            {averageRating && (
              <Badge variant="secondary" className="gap-1 bg-white/20 backdrop-blur">
                <Star className="h-3 w-3 fill-accent text-accent" />
                {averageRating} ({reviews?.length} reviews)
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">{hotel.name}</h1>
          <div className="mt-2 flex items-center gap-1 text-white/80">
            <MapPin className="h-4 w-4" />
            {hotel.address || hotel.city}
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="rooms" className="mt-8">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-none">
          <TabsTrigger value="rooms" className="gap-2">
            <Bed className="h-4 w-4" />
            {t("availableRooms")}
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            {t("reviews")} ({reviews?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="mt-6">
          {/* About Section */}
          {hotel.description && (
            <div className="mb-8">
              <h2 className="mb-3 text-xl font-semibold">{t("about")}</h2>
              <p className="text-muted-foreground">{hotel.description}</p>
            </div>
          )}

          {/* Rooms */}
          <h2 className="mb-4 text-xl font-semibold">{t("availableRooms")}</h2>
          {roomsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : !rooms || rooms.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">{t("noRooms")}</p>
          ) : (
            <div className="space-y-4">
              {rooms.map((room: Room) => (
                <RoomCard key={room.id} room={room} onBook={handleBookRoom} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          {/* Review Form */}
          <div className="mb-6">
            <ReviewForm hotelId={hotelId} onSuccess={() => mutateReviews()} />
          </div>

          {/* Reviews List */}
          <h2 className="mb-4 text-xl font-semibold">{t("reviews")}</h2>
          {!reviews || reviews.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">{t("noReviews")}</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: Review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
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
