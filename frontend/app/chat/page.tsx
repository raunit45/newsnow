"use client"

import Chatbot from "@/components/chatbot"

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef2ff] via-white to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-slate-900">AI Chatbot</h1>
          <p className="text-slate-600 mt-2">Your intelligent assistant for news, weather, and more</p>
        </div>
        <Chatbot fullname="" />
      </div>
    </div>
  )
}
