"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface HotelSearchProps {
  locale: string
  initialCity?: string
  initialCountry?: string
}

export function HotelSearch({ locale, initialCity, initialCountry }: HotelSearchProps) {
  const t = useTranslations("hotels")
  const router = useRouter()
  const [city, setCity] = useState(initialCity || "")
  const [country, setCountry] = useState(initialCountry || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set("city", city)
    if (country) params.set("country", country)
    const query = params.toString()
    router.push(`/${locale}/hotels${query ? `?${query}` : ""}`)
  }

  const clearFilters = () => {
    setCity("")
    setCountry("")
    router.push(`/${locale}/hotels`)
  }

  const hasFilters = city || country

  return (
    <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {t("city")}
        </label>
        <Input
          placeholder={t("city")}
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <div className="flex-1">
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {t("country")}
        </label>
        <Input
          placeholder={t("country")}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="gap-2">
          <Search className="h-4 w-4" />
          {t("filters")}
        </Button>
        {hasFilters && (
          <Button type="button" variant="outline" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  )
}
