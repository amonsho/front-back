"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Globe, X, SlidersHorizontal } from "lucide-react"

interface HotelSearchProps {
  locale: string
  initialQuery?: string
  initialCity?: string
  initialCountry?: string
}

export function HotelSearch({ locale, initialQuery, initialCity, initialCountry }: HotelSearchProps) {
  const t = useTranslations("hotels")
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery || "")
  const [city, setCity] = useState(initialCity || "")
  const [country, setCountry] = useState(initialCountry || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (city) params.set("city", city)
    if (country) params.set("country", country)
    const queryString = params.toString()
    router.push(`/${locale}/hotels${queryString ? `?${queryString}` : ""}`)
  }

  const clearFilters = () => {
    setQuery("")
    setCity("")
    setCountry("")
    router.push(`/${locale}/hotels`)
  }

  const hasFilters = query || city || country

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="flex flex-col lg:flex-row gap-0 rounded-2xl overflow-hidden border border-border shadow-card bg-card">
        {/* Поиск по названию */}
        <div className="flex-[2] flex items-center gap-3 px-4 py-3 border-b lg:border-b-0 lg:border-r border-border">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Search className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
              Название / ключевое слово
            </label>
            <input
              className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/50 outline-none"
              placeholder="Отель, курорт, апартаменты..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {query && (
            <button type="button" onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Город */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3 border-b lg:border-b-0 lg:border-r border-border">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
            <MapPin className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
              {t("city")}
            </label>
            <input
              className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/50 outline-none"
              placeholder="Москва, Дубай..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          {city && (
            <button type="button" onClick={() => setCity("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Страна */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3 border-b lg:border-b-0 border-border">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
            <Globe className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
              {t("country")}
            </label>
            <input
              className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/50 outline-none"
              placeholder="Россия, ОАЭ..."
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
          {country && (
            <button type="button" onClick={() => setCountry("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex items-center gap-2 p-3">
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-11 w-11 rounded-xl p-0 text-muted-foreground hover:text-foreground shrink-0"
              title="Сбросить фильтры"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="submit"
            className="h-11 gap-2 rounded-xl px-5 font-semibold shadow-sm whitespace-nowrap"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Найти</span>
          </Button>
        </div>
      </div>
    </form>
  )
}
