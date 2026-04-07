import { getTranslations, setRequestLocale } from "next-intl/server"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, CreditCard, Clock, Shield, Star, MapPin, ArrowRight } from "lucide-react"

interface HomePageProps {
  params: Promise<{ locale: string }>
}

// Demo hotels for landing page (when backend is not available)
const demoHotels = [
  {
    id: 1,
    name: "Grand Plaza Hotel",
    city: "New York",
    country: "USA",
    stars: 5,
    description: "Luxury in the heart of Manhattan",
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  },
  {
    id: 2,
    name: "Seaside Resort",
    city: "Miami",
    country: "USA",
    stars: 4,
    description: "Beautiful ocean views and sandy beaches",
    image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
  },
  {
    id: 3,
    name: "Mountain Lodge",
    city: "Aspen",
    country: "USA",
    stars: 4,
    description: "Perfect getaway in the Rockies",
    image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
  },
]

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("landing")

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Building2 className="mr-1 h-3 w-3" />
              BookingPro
            </Badge>
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {t("title")}
            </h1>
            <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
              {t("subtitle")}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="gap-2">
                <Link href={`/${locale}/hotels`}>
                  {t("searchButton")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={`/${locale}/auth/register`}>
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-2xl font-bold md:text-3xl">
            {t("whyChooseUs")}
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <CreditCard className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{t("feature1Title")}</h3>
                <p className="text-sm text-muted-foreground">{t("feature1Desc")}</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{t("feature2Title")}</h3>
                <p className="text-sm text-muted-foreground">{t("feature2Desc")}</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{t("feature3Title")}</h3>
                <p className="text-sm text-muted-foreground">{t("feature3Desc")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Hotels Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-2xl font-bold md:text-3xl">{t("featuredHotels")}</h2>
            <Button variant="ghost" asChild className="gap-2">
              <Link href={`/${locale}/hotels`}>
                {t("viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {demoHotels.map((hotel) => (
              <Card key={hotel.id} className="group overflow-hidden transition-all hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={hotel.image_url}
                    alt={hotel.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute right-3 top-3">
                    <Badge variant="secondary" className="gap-1 bg-background/90 backdrop-blur">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      {hotel.stars}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold">{hotel.name}</h3>
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {hotel.city}, {hotel.country}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{hotel.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">
            Ready to find your perfect stay?
          </h2>
          <p className="mb-8 text-primary-foreground/80">
            Join thousands of travelers who trust BookingPro for their accommodation needs.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href={`/${locale}/hotels`}>
              Browse Hotels
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
