"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendHorizonal as SendIcon, MessageCircle, X } from "lucide-react"

type Message = { role: "user" | "assistant"; content: string }

export default function Chatbot({ fullname }: { fullname: string }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: `Hello ${fullname || "there"}! How can I help you find news today?` }])
    }
  }, [open])

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener("open-chatbot", handler as EventListener)
    return () => window.removeEventListener("open-chatbot", handler as EventListener)
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const send = async () => {
    if (!input.trim()) return
    const question = input.trim()
    setMessages((m) => [...m, { role: "user", content: question }])
    setInput("")
    setLoading(true)
    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: question }),
      })
      const data = await resp.json()
      const text = data?.answer || (resp.ok ? "Sorry, I couldn't find an answer." : `Error: ${data?.error || 'Unknown error'}`)
      setMessages((m) => [...m, { role: "assistant", content: text }])
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Network error. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-red-600 hover:bg-red-700 text-white p-4 shadow-lg"
        aria-label="Open chat"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-lg shadow-xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700 text-white font-semibold">NewsNow Chat</div>
          <div ref={listRef} className="px-3 py-2 space-y-2 h-72 overflow-y-auto">
            {messages.map((m, i) => (
              <div key={i} className={`text-sm ${m.role === "user" ? "text-right" : "text-left"}`}>
                <span
                  className={`inline-block px-3 py-2 rounded-lg ${
                    m.role === "user" ? "bg-red-600 text-white" : "bg-slate-700 text-gray-100"
                  }`}
                >
                  {m.content}
                </span>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-700 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about any news..."
              className="bg-slate-700 border-slate-600 text-white"
            />
            <Button onClick={send} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              <SendIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}


