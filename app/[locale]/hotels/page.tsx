import { getTranslations, setRequestLocale } from "next-intl/server"
import { Badge } from "@/components/ui/badge"
import { Building2, Search } from "lucide-react"
import { HotelsList } from "./hotels-list"

interface HotelsPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; city?: string; country?: string; page?: string }>
}

export default async function HotelsPage({ params, searchParams }: HotelsPageProps) {
  const { locale } = await params
  const { q, city, country, page } = await searchParams
  setRequestLocale(locale)
  const t = await getTranslations("hotels")

  return (
    <div className="min-h-screen bg-background">
      {/* Заголовочный баннер */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-blue-700 to-blue-900 py-14">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-amber-400 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-4 lg:px-6 text-center">
          <Badge className="mb-4 bg-white/15 text-white border-white/20 px-3 py-1 text-xs font-semibold">
            <Search className="mr-1.5 h-3 w-3" />
            Поиск отелей
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-white/70 max-w-lg mx-auto text-base">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Контент */}
      <div className="container mx-auto px-4 lg:px-6 py-10">
        <HotelsList
          locale={locale}
          initialQuery={q}
          initialCity={city}
          initialCountry={country}
          initialPage={page ? parseInt(page) : 1}
        />
      </div>
    </div>
  )
}
