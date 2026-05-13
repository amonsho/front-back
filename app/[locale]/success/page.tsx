"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Calendar, Home, Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocale } from "next-intl"
import { API_URL } from "@/lib/api/config"

export default function SuccessPage() {
  const locale = useLocale()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [status, setStatus] = useState<"loading" | "confirmed" | "failed">("loading")

  useEffect(() => {
    if (!sessionId) {
      setStatus("confirmed") // No session_id means direct visit, just show success
      return
    }

    // Call backend to verify and confirm the booking
    fetch(`${API_URL}/payment/payments/verify?session_id=${sessionId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "confirmed" || data.status === "already_confirmed") {
          setStatus("confirmed")
        } else {
          setStatus("failed")
        }
      })
      .catch(() => setStatus("failed"))
  }, [sessionId])

  if (status === "loading") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Подтверждаем ваше бронирование...</p>
        </div>
      </div>
    )
  }

  if (status === "failed") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-red-100 dark:bg-red-950/40 shadow-lg">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-3">Что-то пошло не так</h1>
          <p className="text-muted-foreground text-sm mb-8">Оплата прошла, но не удалось обновить статус бронирования. Пожалуйста, обратитесь в поддержку.</p>
          <Button asChild className="w-full rounded-xl h-11">
            <Link href={`/${locale}/profile`}>Мои бронирования</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-100 dark:bg-emerald-950/40 shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-3">
          Оплата прошла успешно! 🎉
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Ваше бронирование подтверждено. Приятного путешествия!
        </p>

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
            Письмо с подтверждением отправлено на вашу почту. ✈️
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild className="w-full rounded-xl h-11 font-semibold gap-2">
            <Link href={`/${locale}/profile`}>
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
