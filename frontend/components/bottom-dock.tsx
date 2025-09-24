"use client"

import { useEffect, useState } from "react"
import { MessageCircle, CloudSun, Newspaper } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import NewsCard from "@/components/news-card"

type Weather = {
  city: string
  tempC: number
  feelsLikeC: number
  description: string
  humidity: number
  windKph: number
}

interface BottomDockProps {
  visible: boolean
}

export default function BottomDock({ visible }: BottomDockProps) {
  const [tab, setTab] = useState<"news" | "weather" | "chat">("news")
  const [city, setCity] = useState("New York")
  const [weather, setWeather] = useState<Weather | null>(null)
  const [loadingWeather, setLoadingWeather] = useState(false)
  const [articles, setArticles] = useState<any[]>([])
  const [loadingNews, setLoadingNews] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!visible) return
    if (tab === "weather" && !weather) void fetchWeather(city)
    if (tab === "news" && articles.length === 0) void fetchNews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, visible])

  const fetchWeather = async (q: string) => {
    setLoadingWeather(true)
    try {
      const r = await fetch(`/api/weather?q=${encodeURIComponent(q)}`)
      const data = await r.json()
      if (r.ok) setWeather(data)
    } finally {
      setLoadingWeather(false)
    }
  }

  const fetchNews = async () => {
    setLoadingNews(true)
    try {
      const r = await fetch(`/api/news?category=general`)
      const data = await r.json()
      if (r.ok && Array.isArray(data.articles)) setArticles(data.articles.slice(0, 6))
    } finally {
      setLoadingNews(false)
    }
  }

  const openChat = () => {
    window.dispatchEvent(new CustomEvent("open-chatbot"))
  }

  if (!visible) return null

  return (
    <>
      {/* Toggle button when collapsed */}
      {!expanded && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={() => setExpanded(true)}
            className="px-3 py-2 rounded-full bg-red-600 text-white text-sm shadow-lg hover:bg-red-700"
          >
            News • Weather • Chat
          </button>
        </div>
      )}

      {/* Panel when expanded */}
      {expanded && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <div className="mx-auto mb-4 w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-900/90 backdrop-blur shadow-2xl">
            <div className="flex items-center justify-between p-2 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <button onClick={() => setTab("news")} className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${tab==='news'? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-700'}`}>
                  <Newspaper className="w-4 h-4" /> News
                </button>
                <button onClick={() => setTab("weather")} className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${tab==='weather'? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-700'}`}>
                  <CloudSun className="w-4 h-4" /> Weather
                </button>
                <button onClick={() => setTab("chat")} className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${tab==='chat'? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-700'}`}>
                  <MessageCircle className="w-4 h-4" /> Chatbot
                </button>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="px-2 py-1 text-xs rounded-md text-gray-300 hover:text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>

        {tab === "news" && (
          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
            {loadingNews && <div className="text-gray-400 text-sm">Loading top stories…</div>}
            {!loadingNews && articles.map((a, i) => (
              <NewsCard key={i} article={{
                id: `${a.url}-${i}`,
                title: a.title,
                description: a.description,
                url: a.url,
                urlToImage: a.urlToImage,
                publishedAt: a.publishedAt,
                source: { name: a.source?.name || 'Source' },
              }} isBookmarked={false} onToggleBookmark={() => {}} isLoggedIn={true} />
            ))}
          </div>
        )}

        {tab === "weather" && (
          <div className="p-3 flex flex-col gap-3">
            <div className="flex gap-2">
              <Input value={city} onChange={(e)=>setCity(e.target.value)} placeholder="City" className="bg-slate-700 border-slate-600 text-white" />
              <Button onClick={()=>fetchWeather(city)} disabled={loadingWeather} className="bg-red-600 hover:bg-red-700 text-white">Go</Button>
            </div>
            {loadingWeather && <div className="text-gray-400 text-sm">Fetching weather…</div>}
            {!loadingWeather && weather && (
              <div className="grid grid-cols-2 gap-3 text-gray-100">
                <div className="col-span-2 text-lg font-semibold">{weather.city}</div>
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-3xl font-bold">{Math.round(weather.tempC)}°C</div>
                  <div className="text-gray-300 text-sm">Feels {Math.round(weather.feelsLikeC)}°C</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="capitalize">{weather.description}</div>
                  <div className="text-gray-300 text-sm">Wind {weather.windKph} km/h</div>
                  <div className="text-gray-300 text-sm">Humidity {weather.humidity}%</div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "chat" && (
          <div className="p-4 text-center">
            <Button onClick={openChat} className="bg-red-600 hover:bg-red-700 text-white">
              Open Chatbot
            </Button>
            <div className="mt-2 text-gray-400 text-sm">The chat panel will appear on the right.</div>
          </div>
        )}
          </div>
        </div>
      )}
    </>
  )
}


