import { api } from "./client"

export interface ChatMessage {
  id: number
  sender_id: number
  chat_id: number
  text: string
  create_at?: string
}

// Получить историю сообщений
export async function getMessages(chatId: number): Promise<ChatMessage[]> {
  return api.get<ChatMessage[]>(`/chat/messages/${chatId}`)
}

// Получить список всех активных чатов (для админа)
export async function getAdminChats(): Promise<any[]> {
  return api.get<any[]>("/chat/admin/rooms")
}
