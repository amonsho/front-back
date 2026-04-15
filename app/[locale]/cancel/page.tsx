import Link from "next/link"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocale } from "next-intl"

export default function CancelPage() {
  const locale = useLocale()
  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your payment was cancelled or interrupted. No charges have been made to your card.
            You can try paying again from your bookings page.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href={`/${locale}/profile/bookings`}>Go to Bookings</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/${locale}/hotels`}>Back to Hotels</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
