"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Sparkles, MapPin, Phone, Mail, Twitter, Instagram, Facebook, Youtube, Heart, Building2 } from "lucide-react"

interface FooterProps {
  locale: string
}

import { useAuth } from "@/lib/hooks/use-auth"

export function Footer({ locale }: FooterProps) {
  const t = useTranslations("footer")
  const tNav = useTranslations("nav")
  const { isLoggedIn } = useAuth()

  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { href: `/${locale}`, label: tNav("home") },
    { href: `/${locale}/hotels`, label: tNav("hotels") },
    { href: `/${locale}/profile/bookings`, label: tNav("bookings") },
  ]

  const accountLinks = isLoggedIn
    ? [
        { href: `/${locale}/profile`, label: tNav("profile") },
        { href: `/${locale}/profile/bookings`, label: tNav("bookings") },
      ]
    : [
        { href: `/${locale}/auth/login`, label: tNav("login") },
        { href: `/${locale}/auth/register`, label: tNav("register") },
      ]

  const legalLinks = [
    { href: "#", label: t("privacy") },
    { href: "#", label: t("terms") },
    { href: "#", label: t("contact") },
  ]

  const socials = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ]

  return (
    <footer className="bg-[oklch(0.16_0.03_258)] text-white">
      {/* Верхняя секция */}
      <div className="container mx-auto px-4 lg:px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Бренд */}
          <div className="lg:col-span-2">
            <Link href={`/${locale}`} className="group flex items-center gap-2.5 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-700 shadow-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-tight text-white">
                  Booking<span className="text-amber-400">Pro</span>
                </span>
                <span className="text-[9px] font-medium uppercase tracking-widest text-white/50">
                  Premium Hotels
                </span>
              </div>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Ваш надёжный партнёр для бронирования отелей по всему миру. Премиальный сервис, лучшие цены, поддержка 24/7.
            </p>
            {/* Контакты */}
            <div className="mt-5 flex flex-col gap-2.5">
              <a href="tel:+992110049394" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                <Phone className="h-3.5 w-3.5 text-amber-400" />
                +992110049394
              </a>
              <a href="mailto:support@bookingpro.com" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                <Mail className="h-3.5 w-3.5 text-amber-400" />
                support@bookingpro.com
              </a>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                Душанбе, Таджикистан
              </div>
            </div>
            {/* Соцсети */}
            <div className="mt-5 flex gap-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8 text-white/60 hover:bg-primary hover:text-white transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Быстрые ссылки */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
              Навигация
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors hover:translate-x-0.5 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Аккаунт */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
              Аккаунт
            </h3>
            <ul className="space-y-2.5">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors hover:translate-x-0.5 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Правовое */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
              Поддержка
            </h3>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Нижняя полоса */}
      <div className="border-t border-white/8">
        <div className="container mx-auto px-4 lg:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            &copy; {currentYear} BookingPro. {t("rights")}.
          </p>
          <p className="text-xs text-white/40 flex items-center gap-1">
            Сделано с <Heart className="h-3 w-3 text-red-400 fill-red-400" /> для путешественников
          </p>
        </div>
      </div>
    </footer>
  )
}
