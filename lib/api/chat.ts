import { api } from "./client"

export interface ChatMessage {
  id: number
  sender_id: number
  chat_id: number
  text: string
  created_at?: string
}

// Получить историю сообщений
export async function getMessages(chatId: number): Promise<ChatMessage[]> {
  return api.get<ChatMessage[]>(`/chat/messages/${chatId}`)
}
