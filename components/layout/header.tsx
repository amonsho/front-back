"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { api } from "@/lib/api/client"
import { getImageUrl } from "@/lib/api/config"
import { LocaleSwitcher } from "./locale-switcher"
import { User, LogOut, Settings, CalendarDays, Shield, Menu, Building2, Home, Building, MessageSquare } from "lucide-react"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface HeaderProps {
  locale: string
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations("nav")
  const { user, isLoggedIn, isAdmin, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    window.location.href = `/${locale}`
  }

  const navLinks = [
    { href: `/${locale}`, label: t("home"), icon: Home },
    { href: `/${locale}/hotels`, label: t("hotels"), icon: Building },
  ]

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "glass shadow-sm border-b"
          : "bg-background/80 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Логотип */}
        <Link href={`/${locale}`} className="group flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-700 shadow-lg shadow-primary/30 transition-transform duration-200 group-hover:scale-105">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight text-foreground">
              Booking<span className="text-gradient">Pro</span>
            </span>
            <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground -mt-0.5">
              Premium Hotels
            </span>
          </div>
        </Link>

        {/* Десктоп навигация */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/8 hover:text-foreground"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Правая сторона */}
        <div className="flex items-center gap-2">
          <LocaleSwitcher locale={locale} />

          {/* Десктоп авторизация */}
          <div className="hidden items-center gap-2 md:flex">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 rounded-xl px-3 h-9 hover:bg-primary/8"
                  >
                    {user?.avatar ? (
                      <div className="h-6 w-6 overflow-hidden rounded-full ring-2 ring-primary/20">
                        <img
                          src={getImageUrl(user.avatar)}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-700 text-[11px] font-bold text-white">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="max-w-[90px] truncate text-sm font-medium">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg border border-border/60">
                  <div className="px-3 py-2.5 border-b border-border/50">
                    <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <DropdownMenuItem asChild className="rounded-lg">
                      <Link href={`/${locale}/profile`} className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {t("profile")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg">
                      <Link href={`/${locale}/profile/bookings`} className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {t("bookings")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg">
                      <Link href={`/${locale}/profile/messages`} className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {t("messages")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg">
                      <Link href={`/${locale}/profile/settings`} className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Настройки
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link href={`/${locale}/admin`} className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-amber-500" />
                            <span className="text-amber-600 font-medium">{t("admin")}</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-destructive rounded-lg focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("logout")}
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="rounded-xl h-9 px-4 text-sm font-medium hover:bg-primary/8">
                  <Link href={`/${locale}/auth/login`}>{t("login")}</Link>
                </Button>
                <Button size="sm" asChild className="rounded-xl h-9 px-4 text-sm font-semibold shadow-sm btn-glow">
                  <Link href={`/${locale}/auth/register`}>{t("register")}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Мобильное меню */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex flex-col h-full">
                {/* Шапка мобильного меню */}
                <div className="flex items-center gap-2.5 p-5 border-b">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-700 shadow-lg">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-base font-bold">Booking<span className="text-gradient">Pro</span></span>
                </div>

                <nav className="flex flex-col gap-1 p-3">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-primary/8 transition-colors"
                    >
                      <link.icon className="h-4 w-4 text-primary" />
                      {link.label}
                    </Link>
                  ))}

                  {isLoggedIn && (
                    <>
                      <div className="my-2 h-px bg-border mx-2" />
                      <Link
                        href={`/${locale}/profile`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-primary/8 transition-colors"
                      >
                        <User className="h-4 w-4 text-primary" />
                        {t("profile")}
                      </Link>
                      <Link
                        href={`/${locale}/profile/bookings`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-primary/8 transition-colors"
                      >
                        <CalendarDays className="h-4 w-4 text-primary" />
                        {t("bookings")}
                      </Link>
                      <Link
                        href={`/${locale}/profile/messages`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-primary/8 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4 text-primary" />
                        {t("messages")}
                      </Link>
                      {isAdmin && (
                        <Link
                          href={`/${locale}/admin`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-amber-50 transition-colors"
                        >
                          <Shield className="h-4 w-4 text-amber-500" />
                          <span className="text-amber-600 font-medium">{t("admin")}</span>
                        </Link>
                      )}
                      <div className="my-2 h-px bg-border mx-2" />
                      <button
                        onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/8 transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        {t("logout")}
                      </button>
                    </>
                  )}

                  {!isLoggedIn && (
                    <>
                      <div className="my-2 h-px bg-border mx-2" />
                      <div className="flex flex-col gap-2 px-3 pt-2">
                        <Button asChild variant="outline" className="rounded-xl w-full">
                          <Link href={`/${locale}/auth/login`} onClick={() => setMobileMenuOpen(false)}>
                            {t("login")}
                          </Link>
                        </Button>
                        <Button asChild className="rounded-xl w-full">
                          <Link href={`/${locale}/auth/register`} onClick={() => setMobileMenuOpen(false)}>
                            {t("register")}
                          </Link>
                        </Button>
                      </div>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
