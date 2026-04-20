"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import useSWR from "swr"
import type { Hotel } from "@/lib/types"
import { getHotels, searchHotels } from "@/lib/api/hotels"
import { HotelCard } from "@/components/hotels/hotel-card"
import { HotelSearch } from "@/components/hotels/hotel-search"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Building2, Map as MapIcon, List as ListIcon } from "lucide-react"
import MapWrapper from "@/components/map/MapWrapper"

interface HotelsListProps {
  locale: string
  initialQuery?: string
  initialCity?: string
  initialCountry?: string
  initialPage?: number
}

const ITEMS_PER_PAGE = 9

const demoHotels: Hotel[] = [
  {
    id: 1,
    name: "Grand Plaza Hotel",
    city: "New York",
    country: "USA",
    description: "Роскошь в самом сердце Манхэттена с потрясающим видом на город.",
    address: "123 Fifth Avenue",
    photo: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    created_at: "2024-01-01",
  },
  {
    id: 2,
    name: "Seaside Resort",
    city: "Miami",
    country: "USA",
    description: "Красивый вид на океан, песчаные пляжи и тропический рай.",
    address: "456 Ocean Drive",
    photo: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    created_at: "2024-01-01",
  },
  {
    id: 3,
    name: "Mountain Lodge",
    city: "Aspen",
    country: "USA",
    description: "Идеальный отдых в Скалистых горах со ski-in/ski-out доступом.",
    address: "789 Mountain Road",
    photo: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    created_at: "2024-01-01",
  },
  {
    id: 4,
    name: "Urban Boutique Hotel",
    city: "San Francisco",
    country: "USA",
    description: "Современный бутик-отель в центре Сан-Франциско.",
    address: "321 Market Street",
    photo: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
    created_at: "2024-01-01",
  },
  {
    id: 5,
    name: "Historic Inn",
    city: "Boston",
    country: "USA",
    description: "Уютный исторический отель в центре Бостона.",
    address: "555 Colonial Way",
    photo: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    created_at: "2024-01-01",
  },
  {
    id: 6,
    name: "Desert Oasis Resort",
    city: "Phoenix",
    country: "USA",
    description: "Роскошный пустынный ретрит с потрясающими видами на закат.",
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

  useEffect(() => {
    setQuery(initialQuery)
    setCity(initialCity)
    setCountry(initialCountry)
    setPage(1)
  }, [initialQuery, initialCity, initialCountry])

  const { data: hotels, error, isLoading } = useSWR<Hotel[]>(
    ["hotels", page, query, city, country],
    async () => {
      return getHotels(ITEMS_PER_PAGE, (page - 1) * ITEMS_PER_PAGE, city, country, query)
    },
    { fallbackData: demoHotels, revalidateOnFocus: false }
  )

  const totalPages = Math.ceil((hotels?.length || 0) / ITEMS_PER_PAGE)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mb-4">
          <Building2 className="h-8 w-8 text-destructive/60" />
        </div>
        <p className="font-semibold text-foreground">{tCommon("error")}</p>
        <p className="text-sm text-muted-foreground mt-1">Попробуйте обновить страницу</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Поиск */}
      <div>
        <HotelSearch
          locale={locale}
          initialQuery={query}
          initialCity={city}
          initialCountry={country}
        />
      </div>

      {/* Заголовок результатов */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-foreground">
            {hotels ? (
              <>
                <span className="text-primary">{hotels.length}</span>
                {" "}
                {t("resultsFound") || "отелей найдено"}
              </>
            ) : (
              t("searching")
            )}
          </h2>
          {(query || city || country) && (
            <Badge variant="secondary" className="text-xs">
              Фильтры применены
            </Badge>
          )}
        </div>

        {/* Переключатель вид */}
        <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              view === "list"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ListIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("listView") || "Список"}</span>
          </button>
          <button
            onClick={() => setView("map")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              view === "map"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MapIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("mapView") || "Карта"}</span>
          </button>
        </div>
      </div>

      {/* Результаты */}
      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3.5 w-1/2" />
                <Skeleton className="h-3.5 w-full" />
                <div className="flex justify-between items-center pt-1">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-8 w-24 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !hotels || hotels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted mb-5">
            <Building2 className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">{t("noResults")}</h3>
          <p className="text-sm text-muted-foreground">
            Попробуйте изменить параметры поиска
          </p>
        </div>
      ) : (
        <>
          {view === "list" ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="h-[600px] w-full overflow-hidden rounded-2xl border shadow-card">
              <MapWrapper hotels={hotels} locale={locale} />
            </div>
          )}

          {/* Пагинация */}
          {view === "list" && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-9 w-9 rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-9 w-9 rounded-xl text-sm font-medium transition-all ${
                      p === page
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-9 w-9 rounded-xl"
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
