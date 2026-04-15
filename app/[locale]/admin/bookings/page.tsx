"use client"

import { useTranslations } from "next-intl"
import useSWR from "swr"
import { getAllBookings } from "@/lib/api/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, CalendarDays } from "lucide-react"
import { format } from "date-fns"

export default function AdminBookingsPage() {
  const t = useTranslations("admin")

  const { data: bookings, error } = useSWR("admin-bookings", () =>
    getAllBookings(100, 0)
  )

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Failed to load bookings: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("bookings")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {!bookings ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <CalendarDays className="mb-4 h-12 w-12" />
              <p>No bookings found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Room ID</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.id}</TableCell>
                    <TableCell>{booking.user_id}</TableCell>
                    <TableCell>{booking.room_id}</TableCell>
                    <TableCell>
                      {booking.date_from ? format(new Date(booking.date_from), "PPP") : "N/A"} -{" "}
                      {booking.date_to ? format(new Date(booking.date_to), "PPP") : "N/A"}
                    </TableCell>
                    <TableCell>{booking.guests}</TableCell>
                    <TableCell>
                      {booking.total_price ? `$${booking.total_price}` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          booking.status === "confirmed"
                            ? "default"
                            : booking.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
