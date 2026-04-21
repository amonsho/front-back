"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { getMessages, type ChatMessage } from "@/lib/api/chat"
import { getAccessToken } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, UserRound, Minimize2 } from "lucide-react"

export function SupportChatWidget() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  
  const ws = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Use chat_id 1 as the Global Support Chat for all users for now
  const chatId = 1

  useEffect(() => {
    // Only connect if widget is open and user is logged in
    if (!isOpen || !user) return

    let isMounted = true

    // Load message history
    getMessages(chatId)
      .then(history => {
        if (isMounted) setMessages(history)
      })
      .catch(err => console.error("Failed to load chat history", err))

    // Determine WS protocol
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    // Connect WS through the same host (the Next.js proxy will catch /api and forward to FastAPI)
    const wsUrl = `${protocol}//${window.location.host}/api/chat/ws/${user.id}/${chatId}`
    
    const socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      if (isMounted) setIsConnected(true)
    }

    socket.onmessage = (event) => {
      if (!isMounted) return
      
      const dataStr = event.data as string
      // The backend sends: "{user_id}: {text}"
      const match = dataStr.match(/^(\d+):\s(.*)$/)
      if (match) {
        setMessages(prev => [
          ...prev,
          {
             id: Date.now(), // Temporary ID since backend doesn't broadcast the DB ID
             sender_id: parseInt(match[1]),
             chat_id: chatId,
             text: match[2],
          }
        ])
      }
    }

    socket.onclose = () => {
      if (isMounted) setIsConnected(false)
    }

    ws.current = socket

    return () => {
      isMounted = false
      socket.close()
    }
  }, [isOpen, user])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !ws.current || !user) return

    // Optimistically add to UI
    const newMsg: ChatMessage = {
      id: Date.now(),
      sender_id: user.id,
      chat_id: chatId,
      text: inputValue.trim(),
    }
    setMessages(prev => [...prev, newMsg])

    // Send through WS (Backend expects just the text)
    ws.current.send(inputValue.trim())
    setInputValue("")
  }

  // If not logged in, we don't show the chat at all (or show a lock icon)
  if (!user) return null

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Chat Window */}
        <div
          className={`mb-4 w-[350px] overflow-hidden rounded-2xl border border-white/20 bg-background/80 shadow-2xl backdrop-blur-xl transition-all duration-300 origin-bottom-right ${
            isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-primary p-4 text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <UserRound className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Поддержка (Live Chat)</h3>
                <p className="text-xs text-primary-foreground/70 flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-400" : "bg-orange-400"} shadow-sm`}></span>
                  {isConnected ? "Онлайн" : "Подключение..."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
               <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 hover:bg-white/10 transition-colors"
                title="Свернуть"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-[320px] overflow-y-auto p-4 flex flex-col gap-3 bg-muted/30">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
                <MessageCircle className="mb-2 h-8 w-8 opacity-20" />
                <p>Напишите нам, если нужна помощь с бронированием!</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.sender_id === user.id
                // Adding a slight entrance animation for feeling premium
                return (
                  <div
                    key={msg.id || i}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-white dark:bg-zinc-800 border dark:border-white/10 rounded-tl-sm text-foreground"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={sendMessage}
            className="flex items-center gap-2 border-t p-3 bg-background"
          >
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1 rounded-full border-muted-foreground/20 bg-muted/50 focus-visible:ring-1"
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || !isConnected}
              className="h-10 w-10 shrink-0 rounded-full shadow-md"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Toggle Button */}
        {!isOpen && (
            <button
            onClick={() => setIsOpen(true)}
            className="group flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all hover:scale-110 hover:shadow-primary/50"
            style={{ animation: "pulse 2s infinite" }}
            >
            <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
            </button>
        )}
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(var(--primary), 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(var(--primary), 0); }
          100% { box-shadow: 0 0 0 0 rgba(var(--primary), 0); }
        }
      `}</style>
    </>
  )
}
