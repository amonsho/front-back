"use client"

import { useTranslations } from "next-intl"
import useSWR from "swr"
import { getHotelsCountReport } from "@/lib/api/admin"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Building2, 
  Bed, 
  Users, 
  CalendarDays, 
  ArrowUpRight, 
  MapPin, 
  Globe,
  TrendingUp,
  Hotel
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: number | string
  icon: any
  trend?: string
  color: string
  isLoading?: boolean
}

function StatCard({ title, value, icon: Icon, trend, color, isLoading }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border bg-card/50 p-6 backdrop-blur-sm transition-all hover:bg-card/80 hover:shadow-xl hover:shadow-primary/5">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
      
      <div className="relative flex flex-col gap-4">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm", color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-1 flex items-baseline justify-between">
            {isLoading ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
            )}
            {trend && !isLoading && (
              <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-500">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const t = useTranslations("admin")

  const { data: report, isLoading } = useSWR(
    "hotels-report",
    () => getHotelsCountReport(),
    {
      fallbackData: { 
        total_hotels: 0,
        total_rooms: 0,
        total_users: 0,
        total_bookings: 0,
        by_city: {}, 
        by_country: {} 
      },
    }
  )

  const stats = [
    {
      title: t("totalHotels"),
      value: report?.total_hotels ?? 0,
      icon: Hotel,
      color: "bg-blue-500",
      trend: "+12%"
    },
    {
      title: t("totalRooms"),
      value: report?.total_rooms ?? 0,
      icon: Bed,
      color: "bg-indigo-500",
      trend: "+5%"
    },
    {
      title: t("totalUsers"),
      value: report?.total_users ?? 0,
      icon: Users,
      color: "bg-violet-500",
      trend: "+18%"
    },
    {
      title: t("totalBookings"),
      value: report?.total_bookings ?? 0,
      icon: CalendarDays,
      color: "bg-amber-500",
      trend: "+24%"
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <LayoutDashboard className="h-4 w-4" />
          <span>Система управления</span>
        </div>
        <div className="flex items-center justify-between">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{t("dashboard")}</h1>
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-2xl border">
                <span className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"/> Система активна</span>
                <span className="h-4 w-px bg-border"/>
                <span>{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard 
            key={stat.title} 
            {...stat} 
            isLoading={isLoading} 
          />
        ))}
      </div>

      {/* Contextual Reports Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* City Report */}
        <div className="relative overflow-hidden rounded-[2.5rem] border bg-card p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/30">
                        <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Отели по городам</h3>
                        <p className="text-sm text-muted-foreground">География присутствия BookingPro</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full"><ArrowUpRight className="h-5 w-5"/></Button>
            </div>

            <div className="grid gap-4">
                {Object.entries(report?.by_city ?? {}).length > 0 ? (
                    Object.entries(report?.by_city ?? {}).map(([city, count]) => (
                        <div key={city} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"/>
                                <span className="font-medium">{city}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">{count} отелей</span>
                                <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${Math.min((count / (report?.total_hotels || 1)) * 100, 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                        <MapPin className="h-12 w-12 opacity-10 mb-2"/>
                        <p className="text-sm italic">Данные о городах отсутствуют</p>
                    </div>
                )}
            </div>
        </div>

        {/* Country Report */}
        <div className="relative overflow-hidden rounded-[2.5rem] border bg-gradient-to-br from-card to-muted/20 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
                        <Globe className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Отели по странам</h3>
                        <p className="text-sm text-muted-foreground">Международное расширение</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {Object.entries(report?.by_country ?? {}).length > 0 ? (
                    Object.entries(report?.by_country ?? {}).map(([country, count]) => (
                        <div key={country} className="flex items-center justify-between group p-3 rounded-2xl bg-background/50 border border-transparent hover:border-border transition-all">
                            <span className="font-medium flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[10px] text-emerald-600 font-bold uppercase">
                                    {country.substring(0, 2)}
                                </span>
                                {country}
                            </span>
                            <span className="text-2xl font-bold tracking-tighter text-emerald-600">{count}</span>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                        <Globe className="h-12 w-12 opacity-10 mb-2"/>
                        <p className="text-sm italic">Данные о странах отсутствуют</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}

// Additional UI components
import { LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"

