import { getTranslations, setRequestLocale } from "next-intl/server"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { GoogleButton } from "@/components/auth/google-button"
import { Sparkles, Shield, Star } from "lucide-react"

interface LoginPageProps {
  params: Promise<{ locale: string }>
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("auth")

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      {/* Левая панель — декоративная */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-hero items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 h-48 w-48 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 h-64 w-64 rounded-full bg-amber-400 blur-3xl" />
        </div>
        <div className="relative text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold mb-4">BookingPro</h2>
          <p className="text-white/70 text-base max-w-xs mx-auto leading-relaxed">
            Ваш надёжный партнёр для бронирования отелей по всему миру
          </p>
          <div className="mt-10 space-y-4">
            {[
              { icon: Shield, text: "Безопасные платежи" },
              { icon: Star, text: "50,000+ отелей по всему миру" },
              { icon: Sparkles, text: "Лучшие цены гарантированы" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-white/80">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Правая панель — форма */}
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
              {t("loginTitle")} 👋
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("loginSubtitle")}</p>
          </div>

          <div className="space-y-5">
            <LoginForm locale={locale} />

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
            {t("noAccount")}{" "}
            <Link
              href={`/${locale}/auth/register`}
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {t("registerButton")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
