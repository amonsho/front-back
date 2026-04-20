"use client"

import { useAuth } from "@/lib/hooks/use-auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Search, User } from "lucide-react"

interface HeroButtonsProps {
  locale: string
  searchLabel: string
  registerLabel?: string
}

export function HeroButtons({ locale, searchLabel }: HeroButtonsProps) {
  const { isLoggedIn } = useAuth()

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        size="lg"
        asChild
        className="gap-2 h-12 px-7 text-base font-semibold rounded-xl shadow-lg btn-glow"
      >
        <Link href={`/${locale}/hotels`}>
          <Search className="h-4 w-4" />
          {searchLabel}
        </Link>
      </Button>

      {isLoggedIn ? (
        <Button
          size="lg"
          variant="outline"
          asChild
          className="gap-2 h-12 px-7 text-base font-semibold rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
        >
          <Link href={`/${locale}/profile`}>
            <User className="h-4 w-4" />
            Личный кабинет
          </Link>
        </Button>
      ) : (
        <Button
          size="lg"
          variant="outline"
          asChild
          className="h-12 px-7 text-base font-semibold rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
        >
          <Link href={`/${locale}/auth/register`}>
            Начать бесплатно
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  )
}

export function CtaButtons({ locale }: { locale: string }) {
  const { isLoggedIn } = useAuth()

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Button
        size="lg"
        asChild
        className="h-12 px-8 text-base font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-white shadow-xl border-0"
      >
        <Link href={`/${locale}/hotels`}>
          <Search className="mr-2 h-4 w-4" />
          Найти отель
        </Link>
      </Button>
      
      {isLoggedIn ? (
        <Button
          size="lg"
          variant="outline"
          asChild
          className="gap-2 h-12 px-8 text-base font-semibold rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20"
        >
          <Link href={`/${locale}/profile/bookings`}>
            Мои бронирования
          </Link>
        </Button>
      ) : (
        <Button
          size="lg"
          variant="outline"
          asChild
          className="h-12 px-8 text-base font-semibold rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20"
        >
          <Link href={`/${locale}/auth/register`}>
            Создать аккаунт
          </Link>
        </Button>
      )}
    </div>
  )
}
