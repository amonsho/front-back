"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { Loader2 } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default function AdminLayout({ children, params }: AdminLayoutProps) {
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const checkAccess = async () => {
      const { locale } = await params
      if (!isLoading && (!user || !isAdmin)) {
        router.push(`/${locale}/auth/login`)
      }
    }
    checkAccess()
  }, [user, isAdmin, isLoading, router, params])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Access denied. Admin only.</p>
      </div>
    )
  }

  return (
    <AdminLayoutContent params={params}>{children}</AdminLayoutContent>
  )
}

function AdminLayoutContent({ children, params }: AdminLayoutProps) {
  const { locale } = use(params)
  
  return (
    <div className="flex min-h-screen">
      <AdminSidebar locale={locale} />
      <main className="flex-1 overflow-auto bg-muted/30 p-6">
        {children}
      </main>
    </div>
  )
}

// Helper to use async params
import { use } from "react"
