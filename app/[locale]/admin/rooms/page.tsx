"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import useSWR from "swr"
import { getRoomsByHotel, createRoom, updateRoom, deleteRoom } from "@/lib/api/rooms"
import { getHotels } from "@/lib/api/hotels"
import { getImageUrl } from "@/lib/api/config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, Wifi } from "lucide-react"
import type { Room, Hotel } from "@/lib/types"

interface RoomFormState {
  hotel_id: number
  room_type: string
  price: number
  wifi: boolean
  photo: File | null
}

export default function AdminRoomsPage() {
  const t = useTranslations("admin")
  const [isOpen, setIsOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<string>("")

  const { data: hotels, error: hotelsError } = useSWR<Hotel[]>("admin-hotels", () => getHotels(100, 0))
  
  const { data: rooms, error: roomsError, mutate } = useSWR<Room[]>(
    selectedHotel ? `admin-rooms-${selectedHotel}` : null,
    () => getRoomsByHotel(Number(selectedHotel))
  )

  const [form, setForm] = useState<RoomFormState>({
    hotel_id: 0,
    room_type: "",
    price: 0,
    wifi: true,
    photo: null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingRoom) {
        // Prepare update data
        const updateData: any = {
          room_type: form.room_type,
          price: form.price,
          wifi: form.wifi,
        }
        if (form.photo) {
          updateData.photo = form.photo
        }
        await updateRoom(editingRoom.id, updateData)
      } else {
        if (!form.photo) {
          alert("Photo is required")
          setIsSubmitting(false)
          return
        }
        await createRoom({
          hotel_id: Number(selectedHotel),
          room_type: form.room_type,
          price: form.price,
          wifi: form.wifi,
          photo: form.photo,
        })
      }
      mutate()
      setIsOpen(false)
      setEditingRoom(null)
      setForm({ hotel_id: 0, room_type: "", price: 0, wifi: true, photo: null })
    } catch (err) {
      console.error("Failed to save room:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (room: Room) => {
    setEditingRoom(room)
    setForm({
      hotel_id: room.hotel_id,
      room_type: room.room_type,
      price: room.price,
      wifi: room.wifi,
      photo: null,
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return
    try {
      await deleteRoom(id)
      mutate()
    } catch (err) {
      console.error("Failed to delete room:", err)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setEditingRoom(null)
      setForm({ hotel_id: 0, room_type: "", price: 0, wifi: true, photo: null })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("rooms")}</h1>
        {selectedHotel && (
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("addRoom")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRoom ? t("editRoom") : t("addRoom")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room_type">Room Type</Label>
                    <Input
                      id="room_type"
                      placeholder="e.g. Deluxe Suite"
                      value={form.room_type}
                      onChange={(e) => setForm({ ...form, room_type: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per night</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: parseFloat(e.target.value) })
                      }
                      required
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 py-2">
                  <input
                    type="checkbox"
                    id="wifi"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={form.wifi}
                    onChange={(e) => setForm({ ...form, wifi: e.target.checked })}
                  />
                  <Label htmlFor="wifi" className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" /> Free WiFi Available
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Room Photo {editingRoom && "(Leave blank to keep current)"}</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] || null })}
                    required={!editingRoom}
                  />
                </div>
                
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingRoom ? "Update" : "Create"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Hotel</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedHotel} onValueChange={setSelectedHotel}>
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder="Select a hotel to manage rooms" />
            </SelectTrigger>
            <SelectContent>
              {hotels?.map((hotel) => (
                <SelectItem key={hotel.id} value={hotel.id.toString()}>
                  {hotel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedHotel && (
        <Card>
          <CardHeader>
            <CardTitle>Rooms List</CardTitle>
          </CardHeader>
          <CardContent>
            {!rooms ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : rooms.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No rooms found for this hotel
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Photo</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>WiFi</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>{room.id}</TableCell>
                      <TableCell>
                        {room.photo ? (
                          <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                          <img 
                            src={getImageUrl(room.photo, "/placeholder-room.jpg")} 
                            alt={room.room_type} 
                            className="h-full w-full object-cover" 
                          />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{room.room_type}</TableCell>
                      <TableCell>${room.price}</TableCell>
                      <TableCell>{room.wifi ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(room)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(room.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
