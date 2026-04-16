"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import useSWR from "swr"
import { getAllBookings, getDeletedBookings, restoreBooking, deleteBooking } from "@/lib/api/admin"
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
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, CalendarDays, RotateCcw } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

export default function AdminBookingsPage() {
  const t = useTranslations("admin")
  const [view, setView] = useState<"active" | "archived">("active")

  const { data: activeBookings, error: activeError, mutate: mutateActive } = useSWR(
    "admin-bookings-active",
    () => getAllBookings(100, 0)
  )

  const { data: archivedBookings, error: archivedError, mutate: mutateArchived } = useSWR(
    "admin-bookings-archived",
    () => getDeletedBookings()
  )

  const handleRestore = async (id: number) => {
    try {
      await restoreBooking(id)
      toast.success("Booking restored successfully")
      mutateActive()
      mutateArchived()
    } catch (err: any) {
      toast.error(err.message || "Failed to restore booking")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to archive this booking?")) return
    try {
      await deleteBooking(id)
      toast.success("Booking archived successfully")
      mutateActive()
      mutateArchived()
    } catch (err: any) {
      toast.error(err.message || "Failed to archive booking")
    }
  }

  const bookings = view === "active" ? activeBookings : archivedBookings
  const error = view === "active" ? activeError : archivedError

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

      <Tabs value={view} onValueChange={(v) => setView(v as any)}>
        <TabsList>
          <TabsTrigger value="active">{t("active") || "Active"}</TabsTrigger>
          <TabsTrigger value="archived">{t("archive") || "Archive"}</TabsTrigger>
        </TabsList>

        <TabsContent value={view} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {view === "active" ? "Current Bookings" : "Archived Bookings"}
              </CardTitle>
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
                      <TableHead className="text-right">Actions</TableHead>
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
                        <TableCell className="text-right">
                          {view === "active" ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(booking.id)}
                            >
                              Archive
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => handleRestore(booking.id)}
                            >
                              <RotateCcw className="h-4 w-4" />
                              Restore
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
