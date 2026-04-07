"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Building2 } from "lucide-react"

interface FooterProps {
  locale: string
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations("footer")
  const tNav = useTranslations("nav")

  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">BookingPro</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Your trusted partner for hotel bookings worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}`} className="text-muted-foreground hover:text-foreground">
                  {tNav("home")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/hotels`} className="text-muted-foreground hover:text-foreground">
                  {tNav("hotels")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="mb-4 font-semibold">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/auth/login`} className="text-muted-foreground hover:text-foreground">
                  {tNav("login")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/auth/register`} className="text-muted-foreground hover:text-foreground">
                  {tNav("register")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/profile/bookings`} className="text-muted-foreground hover:text-foreground">
                  {tNav("bookings")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} BookingPro. {t("rights")}.</p>
        </div>
      </div>
    </footer>
  )
}
