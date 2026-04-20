import { getTranslations, setRequestLocale } from "next-intl/server"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  CreditCard,
  Clock,
  Shield,
  Star,
  MapPin,
  ArrowRight,
  Search,
  Users,
  CheckCircle2,
  Headphones,
  TrendingUp,
  Award,
  Globe,
} from "lucide-react"

import { HeroButtons, CtaButtons } from "@/components/home/auth-buttons"

interface HomePageProps {
  params: Promise<{ locale: string }>
}

const demoHotels = [
  {
    id: 1,
    name: "Grand Plaza Hotel",
    city: "Нью-Йорк",
    country: "США",
    stars: 5,
    rating: 9.4,
    reviews: 2847,
    price: 289,
    description: "Роскошь в самом сердце Манхэттена",
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    badge: "Выбор путешественников",
  },
  {
    id: 2,
    name: "Seaside Resort",
    city: "Майами",
    country: "США",
    stars: 4,
    rating: 8.9,
    reviews: 1923,
    price: 195,
    description: "Панорамный вид на океан и пляж",
    image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    badge: "Лучший вид",
  },
  {
    id: 3,
    name: "Mountain Lodge",
    city: "Аспен",
    country: "США",
    stars: 4,
    rating: 9.1,
    reviews: 1456,
    price: 249,
    description: "Идеальный отдых в Скалистых горах",
    image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    badge: "Топ-рейтинг",
  },
]

const stats = [
  { value: "50,000+", label: "Отелей по всему миру", icon: Building2 },
  { value: "2M+", label: "Довольных гостей", icon: Users },
  { value: "195", label: "Стран и территорий", icon: Globe },
  { value: "4.9★", label: "Средний рейтинг", icon: Star },
]

const destinations = [
  { name: "Дубай", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80", hotels: "1,240 отелей" },
  { name: "Париж", img: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80", hotels: "3,780 отелей" },
  { name: "Бали", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80", hotels: "920 отелей" },
  { name: "Токио", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80", hotels: "2,100 отелей" },
  { name: "Нью-Йорк", img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80", hotels: "4,500 отелей" },
  { name: "Барселона", img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&q=80", hotels: "1,680 отелей" },
]

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("landing")

  return (
    <div className="flex flex-col">
      {/* ─── Герой ─── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Фоновое изображение */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=85"
            alt="Luxury hotel"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.12_0.05_258/0.92)] via-[oklch(0.12_0.05_258/0.75)] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.05_258/0.6)] via-transparent to-transparent" />
        </div>

        {/* Декоративные блюры */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />

        <div className="container relative z-20 mx-auto px-4 lg:px-6 py-20">
          <div className="max-w-2xl">
            <Badge className="mb-5 gap-1.5 bg-amber-500/20 text-amber-300 border-amber-500/30 px-3 py-1.5 text-xs font-semibold">
              <Award className="h-3 w-3" />
              #1 Платформа бронирования отелей
            </Badge>

            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1]">
              {t("title")}
            </h1>

            <p className="mb-8 text-base text-white/75 md:text-lg max-w-xl leading-relaxed">
              {t("subtitle")}
            </p>

            {/* Кнопки */}
            <HeroButtons locale={locale} searchLabel={t("searchButton")} />

            {/* Доверие */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              {[
                "Бесплатная отмена",
                "Лучшие цены",
                "Поддержка 24/7",
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-sm text-white/70">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Статистика ─── */}
      <section className="relative z-10 bg-background">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden shadow-lg -mt-8 mx-4 lg:mx-0">
            {stats.map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 bg-card px-6 py-7 text-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-1">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-2xl font-extrabold text-foreground tracking-tight">{value}</span>
                <span className="text-xs font-medium text-muted-foreground leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Популярные направления ─── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="mb-10 text-center">
            <Badge variant="secondary" className="mb-3 text-xs font-semibold">
              <TrendingUp className="mr-1 h-3 w-3" />
              Популярные направления
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Куда отправиться дальше?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Откройте для себя самые популярные направления по всему миру
            </p>
          </div>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {destinations.map((dest) => (
              <Link
                key={dest.name}
                href={`/${locale}/hotels?city=${encodeURIComponent(dest.name)}`}
                className="group relative overflow-hidden rounded-2xl aspect-[3/4] block"
              >
                <Image
                  src={dest.img}
                  alt={dest.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-3">
                  <p className="text-sm font-bold text-white">{dest.name}</p>
                  <p className="text-xs text-white/70">{dest.hotels}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Рекомендуемые отели ─── */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Badge variant="secondary" className="mb-3 text-xs font-semibold">
                <Star className="mr-1 h-3 w-3 fill-current text-amber-500" />
                {t("featuredHotels")}
              </Badge>
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                Лучшие предложения
              </h2>
            </div>
            <Button variant="outline" asChild className="gap-2 rounded-xl shrink-0">
              <Link href={`/${locale}/hotels`}>
                {t("viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {demoHotels.map((hotel) => (
              <Link
                key={hotel.id}
                href={`/${locale}/hotels/${hotel.id}`}
                className="group card-premium overflow-hidden block"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={hotel.image_url}
                    alt={hotel.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-xs px-2 py-0.5 font-semibold shadow-md">
                      {hotel.badge}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-white">{hotel.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{hotel.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {hotel.city}, {hotel.country}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-lg font-extrabold text-foreground">${hotel.price}</div>
                      <div className="text-xs text-muted-foreground">/ ночь</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{hotel.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-md">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{hotel.rating}</span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-500">Отлично</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{hotel.reviews} отзывов</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Почему мы ─── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              {t("whyChooseUs")}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Мы делаем всё, чтобы ваше путешествие было комфортным от начала до конца
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: CreditCard,
                color: "from-blue-500 to-blue-700",
                title: t("feature1Title"),
                desc: t("feature1Desc"),
              },
              {
                icon: Clock,
                color: "from-emerald-500 to-emerald-700",
                title: t("feature2Title"),
                desc: t("feature2Desc"),
              },
              {
                icon: Shield,
                color: "from-violet-500 to-violet-700",
                title: t("feature3Title"),
                desc: t("feature3Desc"),
              },
              {
                icon: Headphones,
                color: "from-amber-500 to-amber-700",
                title: "Поддержка 24/7",
                desc: "Мы всегда на связи — в любое время суток",
              },
            ].map(({ icon: Icon, color, title, desc }, index) => (
              <div
                key={index}
                className="card-premium p-6 flex flex-col items-start gap-4"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1.5">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA секция ─── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-60 w-60 rounded-full bg-amber-400/20 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-4 lg:px-6 text-center">
          <Badge className="mb-5 bg-white/15 text-white border-white/20 px-3 py-1.5">
            🎉 Специальное предложение
          </Badge>
          <h2 className="mb-4 text-3xl font-extrabold text-white md:text-4xl lg:text-5xl tracking-tight">
            Готовы найти <span className="text-amber-400">идеальный</span> отель?
          </h2>
          <p className="mb-8 text-white/70 max-w-lg mx-auto text-base">
            Присоединяйтесь к миллионам путешественников, которые выбирают BookingPro для своего отдыха.
          </p>
          <CtaButtons locale={locale} />
        </div>
      </section>
    </div>
  )
}
