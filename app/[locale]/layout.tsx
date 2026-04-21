import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { locales } from "@/lib/i18n/config"
import { AuthProvider } from "@/lib/hooks/use-auth"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "@/components/ui/sonner"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { SupportChatWidget } from "@/components/chat/support-chat-widget"

import type { Metadata } from 'next'

export const metadata: Metadata = {
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  // Validate locale
  if (!locales.includes(locale as typeof locales[number])) {
    notFound()
  }

  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <GoogleOAuthProvider clientId="58499815257-98i9t574a6sqhle6g7dagi56h3mrf8eh.apps.googleusercontent.com">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header locale={locale} />
            <main className="flex-1">{children}</main>
            <Footer locale={locale} />
          </div>
          <Toaster position="top-right" richColors />
          <SupportChatWidget />
        </AuthProvider>
      </GoogleOAuthProvider>
    </NextIntlClientProvider>
  )
}

