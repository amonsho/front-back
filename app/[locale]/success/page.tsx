import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations, useLocale } from "next-intl"

export default function SuccessPage() {
  const t = useTranslations("common")
  const locale = useLocale()

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Thank you for your payment. Your booking has been confirmed and we have sent you an email with the details.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href={`/${locale}/profile/bookings`}>View My Bookings</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/${locale}/hotels`}>Back to Hotels</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
