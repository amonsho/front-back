"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { getMessages, type ChatMessage } from "@/lib/api/chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, UserRound, Minimize2, Bot, Sparkles } from "lucide-react"

export function SupportChatWidget() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  
  const ws = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chatId = user?.id || 1

  useEffect(() => {
    if (!isOpen || !user) return

    let isMounted = true

    getMessages(chatId)
      .then(history => {
        if (isMounted) setMessages(history)
      })
      .catch(err => console.error("Failed to load chat history", err))

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const wsHost = apiUrl.replace(/^https?:\/\//, "")
    const wsProtocol = apiUrl.startsWith("https") ? "wss:" : "ws:"
    const wsUrl = `${wsProtocol}//${wsHost}/chat/ws/${user.id}/${chatId}`
    
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
            const exists = prev.some(m => m.id === data.id || (m.text === data.text && m.sender_id === data.sender_id && Date.now() - (m.id || 0) < 1000))
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
  }, [isOpen, user])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !user) return
    
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return

    const newMsg: ChatMessage = {
      id: Date.now(),
      sender_id: user.id,
      chat_id: chatId,
      text: inputValue.trim(),
    }
    setMessages(prev => [...prev, newMsg])

    try {
      ws.current.send(inputValue.trim())
      setInputValue("")
    } catch (err) {
      console.error("Failed to send message:", err)
    }
  }

  if (!user) return null

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
        {/* Chat Window */}
        <div
          className={`mb-4 w-[380px] overflow-hidden rounded-[24px] border border-white/20 bg-background/95 shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom-right ${
            isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-75 opacity-0 translate-y-10 pointer-events-none"
          }`}
        >
          {/* Header - Premium Gradient */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-5 text-primary-foreground shadow-lg">
            {/* Subtle glow effect */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner border border-white/20">
                    <Sparkles className="h-6 w-6 text-white animate-pulse" />
                  </div>
                  <span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-primary ${isConnected ? "bg-green-400" : "bg-orange-400"} shadow-sm`}></span>
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight">Booking04 Support</h3>
                  <p className="text-[11px] font-medium text-primary-foreground/80 flex items-center gap-1.5 uppercase tracking-widest">
                    {isConnected ? "Мы в сети" : "Подключение..."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-2 hover:bg-white/20 transition-all active:scale-95"
                title="Свернуть"
              >
                <Minimize2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-[380px] overflow-y-auto p-5 flex flex-col gap-5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/50 via-background to-background custom-scrollbar">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-6 bg-muted/5 rounded-3xl border border-dashed border-primary/10">
                <div className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 flex">
                    <MessageCircle className="h-8 w-8 text-primary/40" />
                </div>
                <p className="text-sm font-medium text-foreground/80">Привет! Чем мы можем помочь?</p>
                <p className="text-[11px] text-muted-foreground mt-2 max-w-[200px]">
                  Задайте вопрос по бронированию или напишите администратору
                </p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.sender_id === user.id
                const isAI = msg.sender_id === 0
                
                return (
                  <div
                    key={msg.id || i}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-3 duration-500`}
                  >
                    <div className="flex items-center gap-2 mb-1.5 px-0.5">
                       {isAI ? (
                         <div className="flex items-center gap-1.5 py-0.5 px-2 rounded-full bg-primary/10 border border-primary/20">
                            <Bot className="h-3 w-3 text-primary" />
                            <span className="text-[9px] text-primary font-bold uppercase tracking-wider">Помощник AI</span>
                         </div>
                       ) : (
                         <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                           {isMe ? "Вы" : "Админ"}
                         </span>
                       )}
                    </div>
                    
                    <div
                      className={`relative max-w-[88%] px-4 py-3 shadow-sm transition-all hover:shadow-md ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-[20px] rounded-tr-[4px] shadow-primary/20"
                          : isAI 
                            ? "bg-white dark:bg-zinc-800 border border-primary/10 rounded-[20px] rounded-tl-[4px] text-foreground italic leading-relaxed"
                            : "bg-white dark:bg-zinc-800 border border-border rounded-[20px] rounded-tl-[4px] text-foreground"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {msg.create_at && (
                      <span className="text-[9px] text-muted-foreground/60 mt-1.5 font-medium">
                        {new Date(msg.create_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Glass Style */}
          <div className="p-4 bg-background border-t border-border/50">
            <form
                onSubmit={sendMessage}
                className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-2xl border border-border/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300"
            >
                <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Спросите о чем-нибудь..."
                className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm placeholder:text-muted-foreground/60"
                autoFocus
                />
                <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || !isConnected}
                className="h-10 w-10 shrink-0 rounded-xl shadow-lg hover:scale-105 transition-transform active:scale-95"
                >
                <Send className="h-4 w-4" />
                </Button>
            </form>
            <p className="text-[9px] text-center text-muted-foreground/50 mt-2 font-medium uppercase tracking-tight">
                Обычно ответ приходит в течение нескольких минут
            </p>
          </div>
        </div>

        {/* Toggle Button - Liquid Style */}
        {!isOpen && (
            <button
                onClick={() => setIsOpen(true)}
                className="group relative flex h-16 w-16 items-center justify-center transition-all duration-500 active:scale-95"
            >
                {/* Ping animation behind */}
                <span className="absolute inset-0 rounded-3xl bg-primary/30 animate-ping opacity-20"></span>
                <span className="absolute inset-0 rounded-3xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
                
                <div className="relative flex h-full w-full items-center justify-center rounded-[22px] bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(var(--primary),0.3)] transition-all group-hover:shadow-[0_15px_40px_rgba(var(--primary),0.4)] group-hover:-translate-y-1">
                    <MessageCircle className="h-7 w-7 transition-transform group-hover:scale-110 group-hover:rotate-6" />
                    
                    {/* Badge */}
                    <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-primary text-[10px] font-bold shadow-lg border-2 border-primary">
                        1
                    </span>
                </div>
            </button>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--primary), 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(var(--primary), 0.2);
        }
      `}</style>
    </>
  )
}
