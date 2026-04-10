"use client"

import { useTranslations } from "next-intl"
import useSWR from "swr"
import { getHotelsCountReport } from "@/lib/api/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, Bed, Users, CalendarDays } from "lucide-react"

// Demo stats
const demoStats = {
  total_hotels: 12,
  total_rooms: 48,
  total_users: 156,
  total_bookings: 89,
}

export default function AdminDashboardPage() {
  const t = useTranslations("admin")

  const { data: report, isLoading } = useSWR(
    "hotels-report",
    () => getHotelsCountReport(),
    {
      fallbackData: { 
        total_hotels: demoStats.total_hotels, 
        total_rooms: demoStats.total_rooms,
        total_users: demoStats.total_users,
        by_city: {}, 
        by_country: {} 
      },
    }
  )

  const stats = [
    {
      title: t("totalHotels"),
      value: report?.total_hotels ?? demoStats.total_hotels,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: t("totalRooms"),
      value: report?.total_rooms ?? demoStats.total_rooms,
      icon: Bed,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: t("totalUsers"),
      value: report?.total_users ?? demoStats.total_users,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: t("totalBookings"),
      value: demoStats.total_bookings,
      icon: CalendarDays,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">{t("dashboard")}</h1>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-3xl font-bold">{stat.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hotels by Location */}
      {report && report.by_city && report.by_country && (Object.keys(report.by_city).length > 0 || Object.keys(report.by_country).length > 0) && (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {Object.keys(report.by_city).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hotels by City</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(report.by_city).map(([city, count]) => (
                    <div key={city} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{city}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {Object.keys(report.by_country).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hotels by Country</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(report.by_country).map(([country, count]) => (
                    <div key={country} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{country}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
