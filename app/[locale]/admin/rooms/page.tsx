"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import useSWR from "swr"
import { getRoomsByHotel, createRoom, updateRoom, deleteRoom, getDeletedRooms, restoreRoom } from "@/lib/api/rooms"
import { RefreshCw } from "lucide-react"
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
  number_room: number
  price: number
  wifi: boolean
  photos: File[]
}

export default function AdminRoomsPage() {
  const t = useTranslations("admin")
  const [isOpen, setIsOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<string>("")
  const [view, setView] = useState<"active" | "deleted">("active")

  const { data: hotels, error: hotelsError } = useSWR<Hotel[]>("admin-hotels", () => getHotels(100, 0))
  
  const { data: rooms, error: roomsError, mutate } = useSWR<Room[]>(
    selectedHotel ? `admin-rooms-${selectedHotel}-${view}` : null,
    () => view === "active" 
      ? getRoomsByHotel(Number(selectedHotel))
      : getDeletedRooms() // Note: Backend returns all deleted rooms, we might want to filter by hotel on frontend if backend doesn't support hotel_id for deleted
  )

  // Filter deleted rooms by hotel if view is 'deleted'
  const displayedRooms = view === "active" 
    ? rooms 
    : rooms?.filter(r => r.hotel_id === Number(selectedHotel))

  const [form, setForm] = useState<RoomFormState>({
    hotel_id: 0,
    room_type: "",
    number_room: 0,
    price: 0,
    wifi: true,
    photos: [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingRoom) {
        // Prepare update data
        const updateData: any = {
          room_type: form.room_type,
          number_room: form.number_room,
          price: form.price,
          wifi: form.wifi,
        }
        if (form.photos.length > 0) {
          updateData.photos = form.photos
        }
        await updateRoom(editingRoom.id, updateData)
      } else {
        if (form.photos.length === 0) {
          alert("At least one photo is required")
          setIsSubmitting(false)
          return
        }
        await createRoom({
          hotel_id: Number(selectedHotel),
          room_type: form.room_type,
          number_room: form.number_room,
          price: form.price,
          wifi: form.wifi,
          photos: form.photos,
        })
      }
      mutate()
      setIsOpen(false)
      setEditingRoom(null)
      setForm({ hotel_id: 0, room_type: "", number_room: 0, price: 0, wifi: true, photos: [] })
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
      number_room: room.number_room,
      price: room.price,
      wifi: room.wifi,
      photos: [],
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm(t("confirmDelete") || "Are you sure?")) return
    try {
      await deleteRoom(id)
      mutate()
    } catch (err) {
      console.error("Failed to delete room:", err)
    }
  }

  const handleRestore = async (id: number) => {
    try {
      await restoreRoom(id)
      mutate()
    } catch (err) {
      console.error("Failed to restore room:", err)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setEditingRoom(null)
      setForm({ hotel_id: 0, room_type: "", number_room: 0, price: 0, wifi: true, photos: [] })
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room_type" className="text-sm font-semibold tracking-wide uppercase opacity-70">Тип номера</Label>
                    <Input
                      id="room_type"
                      placeholder="Пример: Deluxe Suite"
                      value={form.room_type}
                      onChange={(e) => setForm({ ...form, room_type: e.target.value })}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-semibold tracking-wide uppercase opacity-70">Цена за ночь ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="500"
                      value={isNaN(form.price) ? "" : form.price}
                      onChange={(e) => {
                        const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                        setForm({ ...form, price: val });
                      }}
                      required
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number_room" className="text-sm font-semibold tracking-wide uppercase opacity-70">Номер комнаты</Label>
                    <Input
                      id="number_room"
                      type="number"
                      min="1"
                      placeholder="Пример: 101"
                      value={isNaN(form.number_room) ? "" : form.number_room}
                      onChange={(e) => {
                        const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                        setForm({ ...form, number_room: val });
                      }}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2 flex items-end">
                    <div className="flex items-center space-x-2 py-3 px-4 bg-muted/50 rounded-xl w-full">
                      <input
                        type="checkbox"
                        id="wifi"
                        className="h-5 w-5 rounded border-gray-300"
                        checked={form.wifi}
                        onChange={(e) => setForm({ ...form, wifi: e.target.checked })}
                      />
                      <Label htmlFor="wifi" className="flex items-center gap-2 font-medium">
                        <Wifi className="h-4 w-4" /> Бесплатный WiFi
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photos" className="text-sm font-semibold tracking-wide uppercase opacity-70">
                    Фотографии номера {editingRoom && "(оставьте пустым для сохранения текущих)"}
                  </Label>
                  
                  {editingRoom && editingRoom.photos && editingRoom.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2 p-2 bg-muted/30 rounded-xl border border-dashed">
                      {editingRoom.photos.map((photo, i) => (
                        <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden border">
                          <img 
                            src={getImageUrl(photo, "/placeholder-room.jpg")} 
                            alt="" 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <Input
                    id="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      if (files.length > 10) {
                        alert("Максимум 10 фотографий");
                        e.target.value = "";
                        return;
                      }
                      setForm({ ...form, photos: files });
                    }}
                    required={!editingRoom}
                    className="rounded-xl cursor-pointer"
                  />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest pl-1">
                    Можно выбрать до 10 фотографий одновременно
                  </p>
                </div>
                
                <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/20">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingRoom ? "Сохранить изменения" : "Добавить новый номер"}
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{view === "active" ? t("roomsList") || "Rooms List" : t("deletedRooms") || "Deleted Rooms"}</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant={view === "active" ? "default" : "outline"} 
                size="sm"
                onClick={() => setView("active")}
              >
                {t("activeHotels") || "Active"}
              </Button>
              <Button 
                variant={view === "deleted" ? "default" : "outline"} 
                size="sm"
                onClick={() => setView("deleted")}
              >
                {t("archive") || "Archive"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!rooms ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : displayedRooms?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {view === "active" ? "No rooms found for this hotel" : "No deleted rooms found for this hotel"}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Room #</TableHead>
                    <TableHead>Photo</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>WiFi</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedRooms?.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>{room.id}</TableCell>
                      <TableCell className="font-bold">{room.number_room}</TableCell>
                      <TableCell>
                        {room.photos && room.photos.length > 0 ? (
                          <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                            <img 
                              src={getImageUrl(room.photos[0], "/placeholder-room.jpg")} 
                              alt={room.room_type} 
                              className="h-full w-full object-cover" 
                            />
                            {room.photos.length > 1 && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] font-bold text-white backdrop-blur-[1px]">
                                +{room.photos.length - 1}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground border border-dashed">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{room.room_type}</TableCell>
                      <TableCell>${room.price}</TableCell>
                      <TableCell>{room.wifi ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-right">
                        {view === "active" ? (
                          <>
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
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRestore(room.id)}
                            title={t("restore") || "Restore"}
                          >
                            <RefreshCw className="h-4 w-4 text-blue-500" />
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
      )}
    </div>
  )
}
