"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import useSWR from "swr"
import type { Hotel } from "@/lib/types"
import { getHotels, searchHotels } from "@/lib/api/hotels"
import { HotelCard } from "@/components/hotels/hotel-card"
import { HotelSearch } from "@/components/hotels/hotel-search"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Building2, Map as MapIcon, List as ListIcon } from "lucide-react"
import MapWrapper from "@/components/map/MapWrapper"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface HotelsListProps {
  locale: string
  initialQuery?: string
  initialCity?: string
  initialCountry?: string
  initialPage?: number
}

const ITEMS_PER_PAGE = 9

// Demo hotels for when backend is not available
const demoHotels: Hotel[] = [
  {
    id: 1,
    name: "Grand Plaza Hotel",
    city: "New York",
    country: "USA",
    description: "Experience luxury in the heart of Manhattan with stunning city views and world-class amenities.",
    address: "123 Fifth Avenue",
    photo: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    created_at: "2024-01-01",
  },
  {
    id: 2,
    name: "Seaside Resort",
    city: "Miami",
    country: "USA",
    description: "Beautiful ocean views, sandy beaches, and tropical paradise await you.",
    address: "456 Ocean Drive",
    photo: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    created_at: "2024-01-01",
  },
  {
    id: 3,
    name: "Mountain Lodge",
    city: "Aspen",
    country: "USA",
    description: "Your perfect getaway in the Rocky Mountains with ski-in/ski-out access.",
    address: "789 Mountain Road",
    photo: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    created_at: "2024-01-01",
  },
  {
    id: 4,
    name: "Urban Boutique Hotel",
    city: "San Francisco",
    country: "USA",
    description: "A modern boutique experience in the vibrant heart of San Francisco.",
    address: "321 Market Street",
    photo: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
    created_at: "2024-01-01",
  },
  {
    id: 5,
    name: "Historic Inn",
    city: "Boston",
    country: "USA",
    description: "Charming historic accommodation in the heart of Boston's Freedom Trail.",
    address: "555 Colonial Way",
    photo: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    created_at: "2024-01-01",
  },
  {
    id: 6,
    name: "Desert Oasis Resort",
    city: "Phoenix",
    country: "USA",
    description: "Escape to a luxurious desert retreat with stunning sunset views.",
    address: "888 Cactus Lane",
    photo: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    created_at: "2024-01-01",
  },
]

export function HotelsList({ locale, initialQuery, initialCity, initialCountry, initialPage = 1 }: HotelsListProps) {
  const t = useTranslations("hotels")
  const tCommon = useTranslations("common")
  const [page, setPage] = useState(initialPage)
  const [query, setQuery] = useState(initialQuery)
  const [city, setCity] = useState(initialCity)
  const [country, setCountry] = useState(initialCountry)
  const [view, setView] = useState<"list" | "map">("list")

  // Update filters when URL params change
  useEffect(() => {
    setQuery(initialQuery)
    setCity(initialCity)
    setCountry(initialCountry)
    setPage(1)
  }, [initialQuery, initialCity, initialCountry])

  const { data: hotels, error, isLoading } = useSWR<Hotel[]>(
    ["hotels", page, query, city, country],
    async () => {
      // If there's a global query, use the search endpoint
      if (query) {
        return searchHotels(query)
      }
      // Otherwise use the filtered list endpoint
      return getHotels(ITEMS_PER_PAGE, (page - 1) * ITEMS_PER_PAGE, city, country)
    },
    {
      fallbackData: demoHotels,
      revalidateOnFocus: false,
    }
  )

  const totalPages = Math.ceil((hotels?.length || 0) / ITEMS_PER_PAGE)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{tCommon("error")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search/Filters */}
      <div className="rounded-lg border bg-card p-4">
        <HotelSearch 
          locale={locale} 
          initialQuery={query}
          initialCity={city} 
          initialCountry={country} 
        />
      </div>

      {/* Results Header with Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {hotels ? `${hotels.length} ${t("resultsFound") || "отелей найдено"}` : t("searching")}
        </h2>
        <Tabs value={view} onValueChange={(v) => setView(v as "list" | "map")} className="w-[200px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <ListIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{t("listView") || "Список"}</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{t("mapView") || "Карта"}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : !hotels || hotels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">{t("noResults")}</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search filters
          </p>
        </div>
      ) : (
        <>
          {view === "list" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {hotels && hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="h-[600px] w-full overflow-hidden rounded-xl border shadow-lg">
              <MapWrapper hotels={hotels} locale={locale} />
            </div>
          )}

          {/* Pagination - Only show for list view */}
          {view === "list" && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-4 text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
