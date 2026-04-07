import { getTranslations, setRequestLocale } from "next-intl/server"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { GoogleButton } from "@/components/auth/google-button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"

interface LoginPageProps {
  params: Promise<{ locale: string }>
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("auth")

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t("loginTitle")}</CardTitle>
          <CardDescription>{t("loginSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm locale={locale} />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {t("orContinueWith")}
              </span>
            </div>
          </div>

          <GoogleButton />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link href={`/${locale}/auth/register`} className="font-medium text-primary hover:underline">
              {t("registerButton")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
