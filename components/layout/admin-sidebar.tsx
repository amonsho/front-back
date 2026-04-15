"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Building2, Bed, Users, ArrowLeft, CalendarDays } from "lucide-react"

interface AdminSidebarProps {
  locale: string
}

export function AdminSidebar({ locale }: AdminSidebarProps) {
  const t = useTranslations("admin")
  const pathname = usePathname()

  const navItems = [
    { href: `/${locale}/admin`, label: t("dashboard"), icon: LayoutDashboard },
    { href: `/${locale}/admin/hotels`, label: t("hotels"), icon: Building2 },
    { href: `/${locale}/admin/rooms`, label: t("rooms"), icon: Bed },
    { href: `/${locale}/admin/users`, label: t("users"), icon: Users },
    { href: `/${locale}/admin/bookings`, label: t("bookings"), icon: CalendarDays },
  ]

  return (
    <aside className="flex w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link href={`/${locale}/admin`} className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-semibold">Admin Panel</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <Button variant="ghost" asChild className="w-full justify-start gap-2">
          <Link href={`/${locale}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Site
          </Link>
        </Button>
      </div>
    </aside>
  )
}
