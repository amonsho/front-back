"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { useTranslations } from "next-intl"
import { getMessages, type ChatMessage } from "@/lib/api/chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Bot, ArrowLeft, ShieldCheck, Wifi, WifiOff } from "lucide-react"
import Link from "next/link"
import { API_URL } from "@/lib/api/config"

// Strip the admin-offline markdown notice for cleaner display
function cleanText(text: string): string {
  return text
    .replace(/\n*_\(Администратора сейчас нет в сети[^)]*\)_/g, "")
    .trim()
}

export default function MessagesPage() {
  const t = useTranslations("profile")
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const ws = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // chat_id === user.id keeps each user's support chat private
  const chatId = user?.id || 1

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const connect = useCallback(() => {
    if (!user) return

    const wsBase = API_URL.replace(/^https/, "wss").replace(/^http/, "ws")
    const wsUrl = `${wsBase}/chat/ws/${user.id}/${chatId}`

    const socket = new WebSocket(wsUrl)
    ws.current = socket

    socket.onopen = () => {
      setIsConnected(true)
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (Array.isArray(data)) {
          setMessages(data)
        } else {
          // Show typing indicator briefly for AI messages
          if (data.sender_id === 0) setIsTyping(false)
          setMessages((prev) => {
            const isDuplicate = prev.some(
              (m) =>
                m.id === data.id ||
                (m.text === data.text &&
                  m.sender_id === data.sender_id &&
                  Math.abs(Date.now() - new Date(m.create_at || "").getTime()) < 2000)
            )
            return isDuplicate ? prev : [...prev, data]
          })
        }
      } catch {
        /* ignore parse errors */
      }
    }

    socket.onclose = () => {
      setIsConnected(false)
      // Auto-reconnect after 3 seconds
      reconnectTimer.current = setTimeout(() => {
        if (ws.current?.readyState !== WebSocket.OPEN) connect()
      }, 3000)
    }

    socket.onerror = () => socket.close()
  }, [user, chatId])

  useEffect(() => {
    if (!user) return

    // Load history first
    getMessages(chatId)
      .then((history) => setMessages(history))
      .catch(console.error)

    connect()

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      ws.current?.close()
    }
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputValue.trim() || !user || !isConnected) return
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return

    const trimmed = inputValue.trim()

    // Optimistic UI update
    const optimistic: ChatMessage = {
      id: Date.now(),
      sender_id: user.id,
      chat_id: chatId,
      text: trimmed,
      create_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])
    setIsTyping(true)

    ws.current.send(trimmed)
    setInputValue("")
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg mb-4">Пожалуйста, войдите в систему</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{t("myMessages")}</h1>
          <p className="text-muted-foreground text-xs">{t("messagesSubtitle")}</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-border/40 shadow-xl bg-card/50 backdrop-blur-sm">
        {/* Chat header */}
        <CardHeader className="border-b bg-muted/30 py-3 px-5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Поддержка Booking04</CardTitle>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isConnected ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-orange-500" />
                  )}
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    {isConnected ? "Онлайн" : "Переподключение..."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 px-5 py-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex h-52 flex-col items-center justify-center text-center text-muted-foreground">
                <MessageCircle className="mb-4 h-10 w-10 opacity-10" />
                <p className="text-sm max-w-xs">
                  Напишите нам — AI-помощник ответит мгновенно, а администратор подключится при необходимости.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.sender_id === user.id
                const isAI = msg.sender_id === 0
                const displayText = cleanText(msg.text)
                if (!displayText) return null

                return (
                  <div
                    key={msg.id || index}
                    className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1 duration-200`}
                  >
                    {!isMe && (
                      <div className="shrink-0 mt-1">
                        {isAI ? (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <ShieldCheck className="h-4 w-4 text-blue-500" />
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`flex flex-col gap-1 max-w-[78%] ${isMe ? "items-end" : "items-start"}`}>
                      <span className="text-[10px] font-semibold uppercase tracking-widest opacity-40 px-1">
                        {isMe ? "Вы" : isAI ? "AI Поддержка" : "Администратор"}
                      </span>
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed whitespace-pre-wrap ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : isAI
                            ? "bg-muted/70 border border-border/40 rounded-tl-sm text-foreground"
                            : "bg-blue-500/10 border border-blue-500/20 rounded-tl-sm text-foreground font-medium"
                        }`}
                      >
                        {displayText}
                      </div>
                      {msg.create_at && (
                        <span className={`text-[9px] opacity-40 px-1 ${isMe ? "text-right" : "text-left"}`}>
                          {new Date(msg.create_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}

            {/* AI typing indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-start animate-in fade-in duration-200">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted/70 border border-border/40 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:0ms]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:150ms]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border/40 bg-muted/20 shrink-0">
          <form
            onSubmit={sendMessage}
            className="flex gap-2 bg-background rounded-2xl border border-border/40 shadow-sm p-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all"
          >
            <Input
              className="border-none focus-visible:ring-0 bg-transparent text-sm"
              placeholder={isConnected ? "Введите сообщение..." : "Подключение..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={!isConnected}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || !isConnected}
              className="rounded-xl shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
