"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { useAuth } from "@/lib/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Send, User, MessageSquare, Bot, ArrowLeft, MoreVertical, ShieldCheck, Clock } from "lucide-react"
import { format } from "date-fns"
import { api } from "@/lib/api/client"
import { API_URL } from "@/lib/api/config"
import { toast } from "sonner"

interface ChatMessage {
  id: number
  chat_id: number
  sender_id: number
  text: string
  create_at: string
}

interface ChatRoom {
  chat_id: number
  user_name: string
  last_message: string
  last_time: string
  unread_count: number
}

// Utility to clean AI messages from offline notices for admin view
const cleanMessageText = (text: string) => {
  return text.replace(/\n*\(Примечание: Администратора сейчас нет в сети, он ответит вам, как только зайдет в чат\)/g, "").trim();
};

export default function AdminChatPage() {
  const t = useTranslations("chat")
  const { user } = useAuth()
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const socketRef = useRef<WebSocket | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchRooms = async () => {
    try {
      const data = await api.get<ChatRoom[]>("/chat/admin/rooms")
      setRooms(data)
    } catch (error) {
      console.error("Failed to fetch rooms", error)
    }
  }

  useEffect(() => {
    fetchRooms()
    const interval = setInterval(fetchRooms, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!activeRoom) return

    if (socketRef.current) {
      socketRef.current.close()
    }

    const wsUrl = `${API_URL.replace("http", "ws")}/chat/ws/${user?.id}/${activeRoom.chat_id}`
    const socket = new WebSocket(wsUrl)
    socketRef.current = socket

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (Array.isArray(data)) {
          setMessages(data)
        } else {
          setMessages((prev) => {
            const exists = prev.some(m => m.id === data.id || (m.text === data.text && m.sender_id === data.sender_id && Math.abs(Date.now() - (new Date(m.create_at || "").getTime() || 0)) < 1000))
            if (exists) return prev
            return [...prev, data]
          })
        }
      } catch (err) {
        console.error("Failed to parse admin chat message", err)
      }
    }

    return () => {
      socket.close()
    }
  }, [activeRoom])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim() || !socketRef.current || !activeRoom) return

    const messageData = {
      text: inputValue,
    }

    socketRef.current.send(JSON.stringify(messageData))
    setInputValue("")
  }

  const filteredRooms = rooms.filter(room => 
    room.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto py-8 h-[calc(100vh-6rem)] max-w-7xl">
      <div className="grid grid-cols-12 gap-8 h-full">
        {/* Chat List - Left Sidebar */}
        <div className="col-span-12 lg:col-span-4 flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between px-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-primary" />
              Чат поддержки
            </h1>
            <Badge className="rounded-full px-3 bg-primary/10 text-primary hover:bg-primary/20 border-none">
              {rooms.length} активных
            </Badge>
          </div>

          <Card className="flex-1 flex flex-col overflow-hidden border-border/40 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[24px]">
            <div className="p-4 border-b border-border/20 bg-muted/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input
                  placeholder="Поиск по имени..."
                  className="pl-10 h-11 bg-background/50 border-border/20 rounded-xl focus:ring-primary/20 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1 px-2 pt-2">
              <div className="space-y-2 pb-4">
                {filteredRooms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50">
                    <User className="h-12 w-12 mb-3" />
                    <p className="text-sm font-medium">Активных чатов не найдено</p>
                  </div>
                ) : (
                  filteredRooms.map((room) => (
                    <button
                      key={room.chat_id}
                      onClick={() => setActiveRoom(room)}
                      className={`w-full group relative flex items-center gap-3 p-3.5 rounded-[18px] transition-all duration-300 ${
                        activeRoom?.chat_id === room.chat_id
                          ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.01]"
                          : "hover:bg-muted/60"
                      }`}
                    >
                      <div className="relative">
                        <Avatar className={`h-12 w-12 border-2 transition-colors ${activeRoom?.chat_id === room.chat_id ? "border-white/30" : "border-border/10"}`}>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${room.user_name}`} />
                          <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-green-500`} />
                      </div>
                      
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-bold text-sm tracking-tight truncate">{room.user_name}</span>
                          <span className={`text-[10px] font-medium opacity-60 ${activeRoom?.chat_id === room.chat_id ? "text-primary-foreground" : "text-muted-foreground"}`}>
                            {room.last_time}
                          </span>
                        </div>
                        <p className={`text-xs truncate font-medium ${activeRoom?.chat_id === room.chat_id ? "text-primary-foreground/80" : "text-muted-foreground/70"}`}>
                          {room.last_message ? cleanMessageText(room.last_message) : "Нет сообщений"}
                        </p>
                      </div>
                      
                      {room.unread_count > 0 && activeRoom?.chat_id !== room.chat_id && (
                        <div className="h-5 w-5 flex items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                          {room.unread_count}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Chat Window - Right Section */}
        <div className="col-span-12 lg:col-span-8 h-full">
          <Card className="h-full flex flex-col overflow-hidden border-border/40 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[32px]">
            {activeRoom ? (
              <>
                <div className="border-b border-border/20 bg-muted/10 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-primary/10 shadow-sm">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeRoom.user_name}`} />
                      <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                        {activeRoom.user_name}
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      </h2>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Online</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Chat ID: {activeRoom.chat_id}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5">
                      <MoreVertical className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar" ref={scrollRef}>
                  <div className="space-y-8">
                    {messages.map((msg, index) => {
                      const isAi = msg.sender_id === 0;
                      const isUser = msg.sender_id === activeRoom.chat_id;
                      const isAdmin = msg.sender_id !== 0 && msg.sender_id !== activeRoom.chat_id;
                      
                      const cleanedText = cleanMessageText(msg.text);
                      if (!cleanedText && isAi) return null; // Skip if it was only the notice

                      return (
                        <div
                          key={msg.id || index}
                          className={`flex items-end gap-3 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}
                        >
                          {!isAdmin && (
                            <div className="shrink-0 mb-1">
                              {isAi ? (
                                <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                                  <Bot className="h-5 w-5 text-primary" />
                                </div>
                              ) : (
                                <Avatar className="h-8 w-8 border border-border/10 shadow-sm">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeRoom.user_name}`} />
                                  <AvatarFallback><User /></AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          )}
                          
                          <div className={`flex flex-col gap-1.5 max-w-[75%] ${isAdmin ? "items-end" : "items-start"}`}>
                            {isAi && (
                              <span className="text-[9px] font-bold text-primary uppercase tracking-widest px-2 mb-0.5">
                                AI Assistant
                              </span>
                            )}
                            <div
                              className={`group relative rounded-[20px] px-5 py-3 text-sm shadow-sm transition-all hover:shadow-md ${
                                isAdmin
                                  ? "bg-primary text-primary-foreground rounded-br-[4px] shadow-primary/20"
                                  : isAi 
                                    ? "bg-muted/50 border border-primary/10 rounded-bl-[4px] text-foreground font-medium italic opacity-80"
                                    : "bg-white dark:bg-zinc-900 border border-border/30 rounded-bl-[4px] text-foreground font-medium"
                              }`}
                            >
                              {cleanedText}
                            </div>
                            <span className={`text-[10px] font-bold text-muted-foreground/50 px-2 uppercase tracking-tighter`}>
                              {format(new Date(msg.create_at || new Date()), "HH:mm")}
                            </span>
                          </div>
                          
                          {isAdmin && (
                            <Avatar className="h-8 w-8 mb-1 border-2 border-primary/20 shadow-sm shrink-0">
                              <AvatarImage src={user?.avatar || ""} />
                              <AvatarFallback className="bg-primary text-primary-foreground font-black text-xs">A</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6 bg-muted/5 border-t border-border/20">
                  <div className="relative flex gap-3 items-center bg-background p-2 rounded-[24px] border border-border/30 shadow-inner focus-within:shadow-xl focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-500">
                    <Input
                      className="border-none focus-visible:ring-0 bg-transparent text-sm h-12 px-4 font-medium placeholder:text-muted-foreground/40"
                      placeholder="Напишите сообщение..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button 
                      size="icon" 
                      className="h-12 w-12 rounded-[18px] bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all shrink-0"
                      onClick={handleSendMessage}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-muted/5 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 bg-primary/5 rounded-full blur-[120px]" />
                <div className="relative">
                  <div className="h-32 w-32 rounded-[40px] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-8 shadow-inner border border-primary/5">
                    <MessageSquare className="h-14 w-14 text-primary/30" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight mb-3">Выберите активный чат</h3>
                  <p className="text-muted-foreground text-sm max-w-[280px] font-medium leading-relaxed">
                    Выберите пользователя из списка слева, чтобы начать переписку в режиме реального времени.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
        }
        .dark .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  )
}
