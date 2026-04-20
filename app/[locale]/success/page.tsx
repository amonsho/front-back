"use client"

import Link from "next/link"
import { CheckCircle2, Calendar, ArrowRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocale } from "next-intl"

export default function SuccessPage() {
  const locale = useLocale()

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        {/* Иконка успеха */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-100 dark:bg-emerald-950/40 shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
        </div>

        {/* Заголовок */}
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-3">
          Оплата прошла успешно! 🎉
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Спасибо за оплату. Ваше бронирование подтверждено. Мы отправили вам письмо с деталями на вашу электронную почту.
        </p>

        {/* Детали */}
        <div className="card-premium p-5 text-left mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/40">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Статус бронирования</p>
              <p className="text-xs text-emerald-600 font-medium">Подтверждено</p>
            </div>
          </div>
          <div className="h-px bg-border mb-4" />
          <p className="text-xs text-muted-foreground">
            Письмо с подтверждением отправлено на вашу почту. Приятного путешествия! ✈️
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
