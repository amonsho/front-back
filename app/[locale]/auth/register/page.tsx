import { getTranslations, setRequestLocale } from "next-intl/server"
import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"
import { GoogleButton } from "@/components/auth/google-button"
import { Sparkles, CheckCircle2, Globe, CreditCard } from "lucide-react"

interface RegisterPageProps {
  params: Promise<{ locale: string }>
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("auth")

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      {/* Форма — слева */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Логотип для мобайла */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-700 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              {t("registerTitle")} ✨
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("registerSubtitle")}</p>
          </div>

          <div className="space-y-5">
            <RegisterForm locale={locale} />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[11px] font-semibold uppercase tracking-wider">
                <span className="bg-background px-3 text-muted-foreground">
                  {t("orContinueWith")}
                </span>
              </div>
            </div>

            <GoogleButton />
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t("hasAccount")}{" "}
            <Link
              href={`/${locale}/auth/login`}
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {t("loginButton")}
            </Link>
          </p>
        </div>
      </div>

      {/* Правая декоративная панель */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-hero items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 h-48 w-48 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 left-20 h-64 w-64 rounded-full bg-amber-400 blur-3xl" />
        </div>
        <div className="relative text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="text-6xl">🏨</div>
          </div>
          <h2 className="text-2xl font-extrabold mb-3">Присоединяйтесь к нам</h2>
          <p className="text-white/70 text-sm max-w-xs mx-auto leading-relaxed mb-10">
            Уже более 2 миллионов путешественников доверяют BookingPro
          </p>
          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              { icon: CheckCircle2, text: "Бесплатная регистрация" },
              { icon: Globe, text: "Отели по всему миру" },
              { icon: CreditCard, text: "Безопасные платежи" },
              { icon: Sparkles, text: "Эксклюзивные скидки" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5">
                <Icon className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="text-xs font-medium text-white/90">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
