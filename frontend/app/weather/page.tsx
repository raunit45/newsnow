"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function WeatherPage() {
  const [city, setCity] = useState("New York")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchWeather = async () => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const r = await fetch(`/api/weather?q=${encodeURIComponent(city)}`)
      const j = await r.json()
      if (!r.ok) setError(j?.error || "Failed to fetch weather")
      else setData(j)
    } catch (e) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef2ff] via-white to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-slate-900">Weather</h1>
          <p className="text-slate-600 mt-2">Get current conditions and quick details</p>
        </div>

        <div className="flex gap-2 justify-center">
          <Input value={city} onChange={(e)=>setCity(e.target.value)} placeholder="City" className="bg-white" />
          <Button onClick={fetchWeather} disabled={loading}>Search</Button>
        </div>

        <div className="mt-6">
          {loading && <div className="text-slate-600">Loading…</div>}
          {error && <div className="text-red-600">{error}</div>}
          {data && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
              <div className="text-xl font-semibold text-slate-900">{data.city}</div>
              <div className="mt-2 text-3xl font-bold">{Math.round(data.tempC)}°C</div>
              <div className="text-slate-600">Feels like {Math.round(data.feelsLikeC)}°C</div>
              <div className="mt-2 text-slate-700 capitalize">{data.description}</div>
              <div className="mt-2 text-slate-600 text-sm">Humidity {data.humidity}% • Wind {data.windKph} km/h</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
