import { api } from "./client"

export async function sendChatMessage(prompt: string): Promise<string> {
  const response = await api.post<{ response: string }>("/ai/chat", { prompt })
  return response.response
}
