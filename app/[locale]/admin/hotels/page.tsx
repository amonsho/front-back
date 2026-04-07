"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import useSWR from "swr"
import { getHotels, createHotel, updateHotel, deleteHotel } from "@/lib/api/hotels"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon } from "lucide-react"
import type { Hotel } from "@/lib/types"

interface HotelFormState {
  name: string
  address: string
  city: string
  description: string
  photo: File | null
}

export default function AdminHotelsPage() {
  const t = useTranslations("admin")
  const [isOpen, setIsOpen] = useState(false)
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: hotels, error, mutate } = useSWR("admin-hotels", () =>
    getHotels(100, 0)
  )

  const [form, setForm] = useState<HotelFormState>({
    name: "",
    address: "",
    city: "",
    description: "",
    photo: null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingHotel) {
        // Prepare update data
        const updateData: any = {
          name: form.name,
          address: form.address,
          city: form.city,
          description: form.description,
        }
        if (form.photo) {
          updateData.photo = form.photo
        }
        await updateHotel(editingHotel.id, updateData)
      } else {
        if (!form.photo) {
          alert("Photo is required")
          setIsSubmitting(false)
          return
        }
        await createHotel({
          name: form.name,
          address: form.address,
          city: form.city,
          description: form.description,
          photo: form.photo,
        })
      }
      mutate()
      setIsOpen(false)
      setEditingHotel(null)
      setForm({ name: "", address: "", city: "", description: "", photo: null })
    } catch (err) {
      console.error("Failed to save hotel:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel)
    setForm({
      name: hotel.name || "",
      address: hotel.address || "",
      city: hotel.city || "",
      description: hotel.description || "",
      photo: null, // Keep null, only update if they select a new file
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return
    try {
      await deleteHotel(id)
      mutate()
    } catch (err) {
      console.error("Failed to delete hotel:", err)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setEditingHotel(null)
      setForm({ name: "", address: "", city: "", description: "", photo: null })
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Failed to load hotels: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("hotels")}</h1>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("addHotel")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingHotel ? t("editHotel") : t("addHotel")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo">Photo {editingHotel && "(Leave blank to keep current photo)"}</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] || null })}
                  required={!editingHotel}
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingHotel ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Hotels</CardTitle>
        </CardHeader>
        <CardContent>
          {!hotels ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : hotels.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hotels yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotels.map((hotel) => (
                  <TableRow key={hotel.id}>
                    <TableCell>{hotel.id}</TableCell>
                    <TableCell>
                      {hotel.photo ? (
                        <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                          <img 
                            src={getImageUrl(hotel.photo)} 
                            alt={hotel.name} 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{hotel.name}</TableCell>
                    <TableCell>{hotel.city}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(hotel)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(hotel.id)}
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
    </div>
  )
}
