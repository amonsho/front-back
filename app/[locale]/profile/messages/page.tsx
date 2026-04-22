"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { useTranslations } from "next-intl"
import { getMessages, type ChatMessage } from "@/lib/api/chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, UserRound, Bot, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function MessagesPage() {
  const t = useTranslations("profile")
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  
  const ws = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Use user.id as the chatId for Support to make it private
  const chatId = user?.id || 1

  useEffect(() => {
    if (!user) return

    let isMounted = true

    // Load message history
    getMessages(chatId)
      .then(history => {
        if (isMounted) setMessages(history)
      })
      .catch(err => console.error("Failed to load chat history", err))

    // Determine WS protocol & Host
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const wsHost = apiUrl.replace(/^https?:\/\//, "")
    const wsProtocol = apiUrl.startsWith("https") ? "wss:" : "ws:"
    const wsUrl = `${wsProtocol}//${wsHost}/chat/ws/${user.id}/${chatId}`
    
    console.log("Profile connecting to WS:", wsUrl)
    const socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      if (isMounted) setIsConnected(true)
    }

    socket.onmessage = (event) => {
      if (!isMounted) return
      
      try {
        const data = JSON.parse(event.data)
        
        if (Array.isArray(data)) {
          setMessages(data)
        } else {
          setMessages(prev => {
            const exists = prev.some(m => m.id === data.id || (m.text === data.text && m.sender_id === data.sender_id && Math.abs(Date.now() - (new Date(m.create_at || "").getTime() || 0)) < 1000))
            if (exists) return prev
            return [...prev, data]
          })
        }
      } catch (err) {
        console.error("Failed to parse chat message", err)
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
  }, [user, chatId])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const sendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputValue.trim() || !user || !isConnected) return
    
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not open")
      return
    }

    // Optimistically add to UI
    const newMsg: ChatMessage = {
      id: Date.now(),
      sender_id: user.id,
      chat_id: chatId,
      text: inputValue.trim(),
      create_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, newMsg])

    // Send through WS
    try {
      ws.current.send(inputValue.trim())
      setInputValue("")
    } catch (err) {
      console.error("Failed to send message:", err)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg mb-4">Пожалуйста, войдите в систему</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{t("myMessages")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("messagesSubtitle")}</p>
        </div>
      </div>

      <Card className="h-full flex flex-col overflow-hidden border-border/40 shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b bg-muted/30 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Поддержка Booking04</CardTitle>
                <div className="flex items-center gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-orange-500"}`} />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase opacity-70">
                    {isConnected ? "Онлайн" : "Подключение..."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {messages.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground">
                <MessageCircle className="mb-4 h-12 w-12 opacity-10" />
                <p className="max-w-xs text-sm">Здесь будет отображаться ваша переписка. Напишите нам, если у вас возникли вопросы!</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.sender_id === user.id
                const isAI = msg.sender_id === 0

                return (
                  <div
                    key={msg.id || index}
                    className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    {!isMe && (
                      <div className="h-8 w-8 shrink-0 mt-1">
                        {isAI ? (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <Bot className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border/40">
                            <UserRound className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5 max-w-[80%]">
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                          {isMe ? "Вы" : isAI ? "Support AI" : "Администратор"}
                        </span>
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : isAI 
                              ? "bg-muted border border-border/40 rounded-tl-none italic"
                              : "bg-white dark:bg-zinc-800 border border-border/40 rounded-tl-none text-foreground"
                        }`}
                      >
                        {msg.text}
                      </div>
                      {msg.create_at && (
                        <span className={`text-[9px] font-medium opacity-40 px-1 ${isMe ? "text-right" : "text-left"}`}>
                          {new Date(msg.create_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="p-4 bg-muted/30 border-t border-border/40">
          <form onSubmit={sendMessage} className="flex gap-2 bg-background p-1.5 rounded-2xl border border-border/40 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Input
              className="border-none focus-visible:ring-0 bg-transparent text-sm"
              placeholder="Введите сообщение..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={!isConnected}
            />
            <Button 
              type="submit"
              size="icon" 
              disabled={!inputValue.trim() || !isConnected}
              className="rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
