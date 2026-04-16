"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import useSWR from "swr"
import { getUsers, changeUserRole, deleteUser, getDeletedUsers, restoreUser } from "@/lib/api/admin"
import { Button } from "@/components/ui/button"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Loader2, Shield, User as UserIcon } from "lucide-react"
import type { User, UserRole } from "@/lib/types"

export default function AdminUsersPage() {
  const t = useTranslations("admin")
  const [updatingRole, setUpdatingRole] = useState<number | null>(null)
  const [view, setView] = useState<"active" | "deleted">("active")

  const { data: users, error, mutate } = useSWR(
    `admin-users-${view}`, 
    () => view === "active" ? getUsers(100, 0) : getDeletedUsers(100, 0)
  )

  const handleRoleChange = async (userId: number, role: UserRole) => {
    setUpdatingRole(userId)
    try {
      await changeUserRole(userId, role)
      mutate()
    } catch (err) {
      console.error("Failed to change role:", err)
    } finally {
      setUpdatingRole(null)
    }
  }

  const handleDelete = async (userId: number) => {
    if (!confirm(t("confirmDelete") || "Are you sure?")) return
    try {
      await deleteUser(userId)
      mutate()
    } catch (err) {
      console.error("Failed to delete user:", err)
    }
  }

  const handleRestore = async (userId: number) => {
    try {
      await restoreUser(userId)
      mutate()
    } catch (err) {
      console.error("Failed to restore user:", err)
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Failed to load users: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("users")}</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{view === "active" ? t("users") : t("deletedHotels")}</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant={view === "active" ? "default" : "outline"} 
              size="sm"
              onClick={() => setView("active")}
            >
              {t("activeHotels")}
            </Button>
            <Button 
              variant={view === "deleted" ? "default" : "outline"} 
              size="sm"
              onClick={() => setView("deleted")}
            >
              {t("archive")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!users ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Google</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="font-medium">
                      {user.name || "-"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) =>
                          handleRoleChange(user.id, value as UserRole)
                        }
                        disabled={updatingRole === user.id}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-3 w-3" />
                              user
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-3 w-3" />
                              admin
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {user.google_id ? (
                        <Badge variant="secondary">Linked</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {view === "active" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRestore(user.id)}
                          title={t("restore")}
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
    </div>
  )
}
