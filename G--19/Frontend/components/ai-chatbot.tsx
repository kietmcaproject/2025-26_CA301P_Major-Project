"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Send, X, Loader2 } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentUser, setCurrentUser] = useState<{ role?: string } | null | undefined>(undefined)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null
      if (stored) {
        const parsed = JSON.parse(stored)
        setCurrentUser(parsed)
      }
    } catch (e) {
      console.warn("Failed to read user from localStorage", e)
      setCurrentUser(null)
    }
  }, [])

  // Initialize a role-aware welcome message once we know the user
  useEffect(() => {
    if (!currentUser) return
    if (messages.length > 0) return

    const role = (currentUser as any).role || "user"
    let welcomeText = "Hi! I'm Pulse Bot, your AI assistant. I can help with donations, requests, scheduling, and more. How can I help you today?"

    if (role === "donor") {
      welcomeText = "Hi donor! I'm Pulse Bot. I can help with eligibility, scheduling donations, and marking your availability. Are you planning to donate soon or would you like to schedule an appointment?"
    } else if (role === "hospital") {
      welcomeText = "Hi hospital user! I can help you create and manage blood requests, find nearby donors, and track responses. Would you like to create a new request or view existing requests?"
    } else if (role === "recipient") {
      welcomeText = "Hi recipient! I can assist with submitting a blood request, tracking its status, and finding nearby hospitals. Do you want to create a request now or check an existing one?"
    }

    const initMessage: Message = {
      id: Date.now().toString(),
      text: welcomeText,
      sender: "bot",
      timestamp: new Date(),
    }

    setMessages([initMessage])
    setIsOpen(true)
  }, [currentUser])

  // Require authentication: hide the chatbot unless a user object exists
  if (currentUser === undefined) {
    // still loading localStorage
    return null
  }

  if (currentUser === null) {
    // not authenticated — don't render the chatbot
    return null
  }

  const sendMessage = async () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Grab user role/info from localStorage so server can provide role-aware replies
      let user = null
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null
        if (stored) user = JSON.parse(stored)
      } catch (e) {
        console.warn("Failed to parse user from localStorage", e)
      }

      // Call Gemini API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages,
          user,
        }),
      })

      const data = await response.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply || "Sorry, I couldn't process that. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chatbot Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition hover:from-red-700 hover:to-red-800 z-40"
          aria-label="Open chatbot"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-h-96 bg-white rounded-xl shadow-2xl flex flex-col z-50 border-2 border-red-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex justify-between items-center rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-bold">Pulse Bot</h3>
              <span className="text-xs bg-red-500 px-2 py-1 rounded-full">AI Assistant</span>
              {currentUser ? (
                <span className="text-xs capitalize bg-white/20 text-white px-2 py-1 rounded-full ml-2">{currentUser.role || "user"}</span>
              ) : null}
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-red-500 p-1 rounded transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs rounded-lg p-3 ${
                    msg.sender === "user"
                      ? "bg-red-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-red-200 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-red-200 rounded-lg rounded-bl-none p-3">
                  <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-red-200 p-4 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 border border-red-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-red-600 hover:bg-red-700 text-white p-2"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
