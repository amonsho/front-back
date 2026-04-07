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
import { Building2, User, LogOut, Settings, CalendarDays, Shield, Menu } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface HeaderProps {
  locale: string
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations("nav")
  const { user, isLoggedIn, isAdmin, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    window.location.href = `/${locale}`
  }

  const navLinks = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/hotels`, label: t("hotels") },
  ]

  const authLinks = isLoggedIn
    ? [
        { href: `/${locale}/profile`, label: t("profile"), icon: User },
        { href: `/${locale}/profile/bookings`, label: t("bookings"), icon: CalendarDays },
      ]
    : []

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold text-foreground">BookingPro</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LocaleSwitcher locale={locale} />

          {/* Desktop Auth */}
          <div className="hidden items-center gap-2 md:flex">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 px-2">
                    {user?.avatar ? (
                      <div className="h-6 w-6 overflow-hidden rounded-full">
                        <img 
                          src={getImageUrl(user.avatar)} 
                          alt={user.name} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="max-w-[100px] truncate">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/profile`} className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t("profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/profile/bookings`} className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {t("bookings")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/profile/settings`} className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/${locale}/admin`} className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          {t("admin")}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-destructive">
                    <LogOut className="h-4 w-4" />
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/${locale}/auth/login`}>{t("login")}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/${locale}/auth/register`}>{t("register")}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-4 pt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                {isLoggedIn ? (
                  <>
                    <div className="my-2 h-px bg-border" />
                    {authLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 text-lg font-medium text-foreground"
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link
                        href={`/${locale}/admin`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 text-lg font-medium text-foreground"
                      >
                        <Shield className="h-5 w-5" />
                        {t("admin")}
                      </Link>
                    )}
                    <div className="my-2 h-px bg-border" />
                    <button
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="flex items-center gap-2 text-lg font-medium text-destructive"
                    >
                      <LogOut className="h-5 w-5" />
                      {t("logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="my-2 h-px bg-border" />
                    <Link
                      href={`/${locale}/auth/login`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium text-foreground"
                    >
                      {t("login")}
                    </Link>
                    <Link
                      href={`/${locale}/auth/register`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium text-primary"
                    >
                      {t("register")}
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
