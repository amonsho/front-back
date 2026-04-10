import { getTranslations, setRequestLocale } from "next-intl/server"
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <HotelsList
        locale={locale}
        initialQuery={q}
        initialCity={city}
        initialCountry={country}
        initialPage={page ? parseInt(page) : 1}
      />
    </div>
  )
}
