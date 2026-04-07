import { setRequestLocale } from "next-intl/server"
import { HotelDetails } from "./hotel-details"

interface HotelPageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function HotelPage({ params }: HotelPageProps) {
  const { locale, id } = await params
  setRequestLocale(locale)

  return <HotelDetails hotelId={parseInt(id)} locale={locale} />
}
