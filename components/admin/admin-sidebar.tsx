"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BarChart3, 
  Building2, 
  BedDouble, 
  Users, 
  CalendarCheck, 
  Settings, 
  LogOut,
  ChevronLeft,
  LayoutDashboard
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface SidebarItemProps {
  href: string
  icon: any
  label: string
  active?: boolean
  collapsed?: boolean
}

function SidebarItem({ href, icon: Icon, label, active, collapsed }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group",
        active 
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0 transition-transform duration-200", !active && "group-hover:scale-110")} />
      {!collapsed && <span className="text-sm font-medium tracking-wide">{label}</span>}
    </Link>
  )
}

export function AdminSidebar({ locale }: { locale: string }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { href: `/${locale}/admin`, icon: LayoutDashboard, label: "Дашборд" },
    { href: `/${locale}/admin/hotels`, icon: Building2, label: "Отели" },
    { href: `/${locale}/admin/rooms`, icon: BedDouble, label: "Номера" },
    { href: `/${locale}/admin/bookings`, icon: CalendarCheck, label: "Бронирования" },
    { href: `/${locale}/admin/users`, icon: Users, label: "Пользователи" },
  ]

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-card/50 backdrop-blur-xl transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-full flex-col p-4">
        {/* Logo */}
        <div className={cn("flex items-center gap-3 mb-8 px-2", collapsed && "justify-center")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-700 shadow-lg">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-tight text-foreground">
                Booking<span className="text-primary">Admin</span>
              </span>
              <span className="text-[8px] font-medium uppercase tracking-widest text-muted-foreground">
                Premium Control
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.href}
              {...item}
              active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Footer actions */}
        <div className="mt-auto pt-6 border-t border-border/50 flex flex-col gap-2">
            <SidebarItem
                href={`/${locale}`}
                icon={LogOut}
                label="Выйти из админки"
                collapsed={collapsed}
            />
            
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
                className={cn("w-full justify-start gap-3 rounded-xl px-3", collapsed && "justify-center px-0")}
            >
                <ChevronLeft className={cn("h-5 w-5 transition-transform duration-300", collapsed && "rotate-180")} />
                {!collapsed && <span className="text-xs font-medium uppercase tracking-wider opacity-60">Свернуть</span>}
            </Button>
        </div>
      </div>
    </aside>
  )
}
