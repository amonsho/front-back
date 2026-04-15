"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import ReactMarkdown from "react-markdown"
import { sendChatMessage } from "@/lib/api/ai"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, X, Send, Loader2, Sparkles, User, Bot } from "lucide-react"
import { toast } from "sonner"

interface Message {
  role: "user" | "ai"
  content: string
}

export function AIChatWidget() {
  const tAI = useTranslations("ai")
  
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  // Initial welcome message (only once per session)
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { role: "ai", content: tAI("welcome") }
      ])
    }
  }, [isOpen, messages.length, tAI])

  const handleSend = async () => {
    const trimmedInput = inputValue.trim()
    if (!trimmedInput || isLoading) return

    setInputValue("")

    const userMessage: Message = { role: "user", content: trimmedInput }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // In a real app we'd send the full context, but our backend API only takes a single prompt right now.
      // E.g., we could serialize the last few messages, but we'll try just sending the prompt for simplicity.
      // If we want chat context, we can manually build a prompt string including history:
      const conversationHistory = messages.slice(-4).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\\n')
      const fullPrompt = `${conversationHistory ? "History:\\n" + conversationHistory + "\\n\\n" : ""}User: ${trimmedInput}`
      
      const response = await sendChatMessage(fullPrompt)
      
      setMessages(prev => [...prev, { role: "ai", content: response }])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tAI("error"))
      setMessages(prev => [...prev, { role: "ai", content: tAI("error") }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform bg-primary"
          >
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </Button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[350px] flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 md:w-[400px]">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-primary p-4 text-primary-foreground space-y-0">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <h3 className="font-semibold text-lg">{tAI("title")}</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden relative bg-card">
            <div ref={scrollRef} className="h-full overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 break-words max-w-none text-foreground">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-end gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted text-muted-foreground rounded-lg px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="border-t p-3 bg-card">
            <div className="flex w-full items-center gap-2">
              <Input
                placeholder={tAI("placeholder")}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  )
}
