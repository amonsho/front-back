import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { locales } from "@/lib/i18n/config"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SupportChatWidget } from "@/components/chat/support-chat-widget"
import { Providers } from "@/components/providers"

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
      <Providers>
        <div className="flex min-h-screen flex-col">
          <Header locale={locale} />
          <main className="flex-1">{children}</main>
          <Footer locale={locale} />
        </div>
        <SupportChatWidget />
      </Providers>
    </NextIntlClientProvider>
  )
}


