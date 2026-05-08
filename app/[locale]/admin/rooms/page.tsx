"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import useSWR from "swr"
import { getRoomsByHotel, createRoom, updateRoom, deleteRoom, getDeletedRooms, restoreRoom } from "@/lib/api/rooms"
import { RefreshCw } from "lucide-react"
import { getHotels } from "@/lib/api/hotels"
import { getImageUrl } from "@/lib/api/config"
import { compressImage } from "@/lib/utils/image-compression"
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
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, Wifi, X } from "lucide-react"
import type { Room, Hotel } from "@/lib/types"

interface RoomFormState {
  hotel_id: number
  room_type: string
  number_room: string
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

  const { data: hotels } = useSWR<Hotel[]>("admin-hotels", () => getHotels(100, 0))

  const { data: rooms, mutate } = useSWR<Room[]>(
    selectedHotel ? `admin-rooms-${selectedHotel}-${view}` : null,
    () =>
      view === "active"
        ? getRoomsByHotel(Number(selectedHotel))
        : getDeletedRooms()
  )

  // Filter deleted rooms by hotel if view is 'deleted'
  const displayedRooms =
    view === "active"
      ? rooms
      : rooms?.filter((r) => r.hotel_id === Number(selectedHotel))

  const [form, setForm] = useState<RoomFormState>({
    hotel_id: 0,
    room_type: "",
    number_room: "",
    price: 0,
    wifi: true,
    photos: [],
  })

  // Reset pointer-events after Radix Dialog closes
  const resetPointerEvents = () => {
    setTimeout(() => {
      document.body.style.pointerEvents = "auto"
    }, 100)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      resetPointerEvents()
      setEditingRoom(null)
      setForm({ hotel_id: 0, room_type: "", number_room: "", price: 0, wifi: true, photos: [] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingRoom) {
        const updateData: any = {
          room_type: form.room_type,
          number_room: form.number_room,
          price: form.price,
          wifi: form.wifi,
        }
        if (form.photos.length > 0) {
          const compressedPhotos = await Promise.all(
            form.photos.map((photo) => compressImage(photo))
          )
          updateData.photos = compressedPhotos
        }
        await updateRoom(editingRoom.id, updateData)
      } else {
        if (form.photos.length === 0) {
          alert("At least one photo is required")
          setIsSubmitting(false)
          return
        }

        const compressedPhotos = await Promise.all(
          form.photos.map((photo) => compressImage(photo))
        )

        await createRoom({
          hotel_id: Number(selectedHotel),
          room_type: form.room_type,
          number_room: form.number_room,
          price: form.price,
          wifi: form.wifi,
          photos: compressedPhotos,
        })
      }
      await mutate()
      setIsOpen(false)
      resetPointerEvents()
      setEditingRoom(null)
      setForm({ hotel_id: 0, room_type: "", number_room: "", price: 0, wifi: true, photos: [] })
    } catch (err: any) {
      alert("Ошибка при сохранении: " + (err.message || "Unknown error"))
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
      number_room: room.number_room?.toString() || "",
      price: room.price,
      wifi: room.wifi,
      photos: [],
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить эту комнату?")) return

    if (rooms) {
      mutate(rooms.filter((r) => r.id !== id), false)
    }
    try {
      await deleteRoom(id)
      mutate()
    } catch (err: any) {
      alert("Ошибка при удалении: " + (err.message || "Unknown error"))
      console.error("Failed to delete room:", err)
      mutate()
    }
  }

  const handleRestore = async (id: number) => {
    if (rooms) {
      mutate(rooms.filter((r) => r.id !== id), false)
    }
    try {
      await restoreRoom(id)
      mutate()
    } catch (err: any) {
      alert("Ошибка при восстановлении: " + (err.message || "Unknown error"))
      console.error("Failed to restore room:", err)
      mutate()
    }
  }

  return (
    <div className="space-y-6">
      {/* Controlled Dialog lives OUTSIDE the table — edit/delete can open it freely */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value)
                    setForm({ ...form, price: val })
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
                  value={form.number_room}
                  onChange={(e) => {
                    setForm({ ...form, number_room: e.target.value })
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

            <div className="space-y-3">
              <Label className="text-sm font-semibold tracking-wide uppercase opacity-70">
                Фотографии номера {editingRoom && "(оставьте пустым для сохранения текущих)"}
              </Label>

              {/* Текущие фотографии (при редактировании, если не выбраны новые) */}
              {editingRoom && editingRoom.photos && editingRoom.photos.length > 0 && form.photos.length === 0 && (
                <div className="flex flex-wrap gap-3 mb-2 p-3 bg-muted/20 rounded-xl border border-dashed border-primary/20">
                  {editingRoom.photos.map((photo, i) => (
                    <div key={i} className="relative h-20 w-20 rounded-xl overflow-hidden border shadow-sm group">
                      <img
                        src={getImageUrl(photo, "/placeholder-room.jpg")}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                  ))}
                </div>
              )}

              {/* Превью НОВЫХ выбранных фотографий */}
              {form.photos.length > 0 && (
                <div className="flex flex-wrap gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20 shadow-inner">
                  {form.photos.map((file, i) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <div key={i} className="relative h-20 w-20 rounded-xl overflow-hidden border border-primary/30 shadow-sm group">
                        <img src={url} alt={file.name} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            const newPhotos = [...form.photos];
                            newPhotos.splice(i, 1);
                            setForm({ ...form, photos: newPhotos });
                          }}
                          className="absolute top-1 right-1 h-6 w-6 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:scale-110 shadow-lg"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-center h-20 px-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 text-primary/80 font-medium text-sm">
                    {form.photos.length} фото выбрано
                  </div>
                </div>
              )}

              {/* Красивая зона загрузки */}
              <div className="relative group mt-2">
                <Input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const newFiles = e.target.files ? Array.from(e.target.files) : []
                    
                    // Объединяем старые и новые файлы
                    const combinedFiles = [...form.photos, ...newFiles]
                    
                    // Убираем дубликаты (если случайно выбрали один и тот же файл дважды)
                    const uniqueFiles = combinedFiles.filter((file, index, self) =>
                      index === self.findIndex((f) => f.name === file.name && f.size === file.size)
                    )

                    if (uniqueFiles.length > 10) {
                      alert("Максимум 10 фотографий в сумме")
                      e.target.value = ""
                      return
                    }
                    
                    setForm({ ...form, photos: uniqueFiles })
                    // Очищаем value у input, чтобы можно было заново выбрать те же файлы при необходимости
                    e.target.value = ""
                  }}
                  required={!editingRoom && form.photos.length === 0}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  title="Нажмите, чтобы выбрать файлы"
                />
                <div className="flex flex-col items-center justify-center py-8 px-4 bg-muted/30 border-2 border-dashed border-muted-foreground/30 rounded-xl transition-all duration-300 group-hover:bg-primary/5 group-hover:border-primary/50 text-center shadow-sm group-hover:shadow-md">
                  <div className="h-12 w-12 rounded-full bg-background border flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <ImageIcon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-base font-semibold text-foreground">
                    Нажмите или перетащите фото сюда
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 font-medium tracking-wide uppercase">
                    Выбрано: {form.photos.length} / 10 файлов (PNG, JPG, JPEG)
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/20">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingRoom ? "Сохранить изменения" : "Добавить новый номер"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("rooms")}</h1>
        {selectedHotel && (
          <Button onClick={() => {
            setEditingRoom(null)
            setForm({ hotel_id: 0, room_type: "", number_room: "", price: 0, wifi: true, photos: [] })
            setIsOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addRoom")}
          </Button>
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
