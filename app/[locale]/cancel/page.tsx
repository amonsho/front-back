"use client"

import Link from "next/link"
import { XCircle, Calendar, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocale } from "next-intl"

export default function CancelPage() {
  const locale = useLocale()

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        {/* Иконка отмены */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-red-100 dark:bg-red-950/40 shadow-lg shadow-red-500/20">
          <XCircle className="h-12 w-12 text-red-500 dark:text-red-400" />
        </div>

        {/* Заголовок */}
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-3">
          Оплата отменена
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Ваш платёж был отменён или прерван. Никаких списаний с вашей карты не произошло. Вы можете попробовать снова.
        </p>

        {/* Детали */}
        <div className="card-premium p-5 text-left mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/40">
              <RefreshCw className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Что делать дальше?</p>
              <p className="text-xs text-muted-foreground">Перейдите к бронированиям для повторной оплаты</p>
            </div>
          </div>
          <div className="h-px bg-border mb-4" />
          <p className="text-xs text-muted-foreground">
            Ваше бронирование сохранено в статусе «Ожидает». Вы можете оплатить его в любое время.
          </p>
        </div>

        {/* Кнопки */}
        <div className="flex flex-col gap-3">
          <Button asChild className="w-full rounded-xl h-11 font-semibold gap-2">
            <Link href={`/${locale}/profile/bookings`}>
              <Calendar className="h-4 w-4" />
              Мои бронирования
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full rounded-xl h-11 font-medium gap-2">
            <Link href={`/${locale}/hotels`}>
              <Home className="h-4 w-4" />
              Вернуться к отелям
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
