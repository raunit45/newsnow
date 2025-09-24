import { NextResponse, type NextRequest } from "next/server"

// Uses OpenWeatherMap current weather by city name
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || ""
    const key = process.env.WEATHER_API_KEY
    if (!key) return NextResponse.json({ error: "Missing WEATHER_API_KEY" }, { status: 500 })
    if (!q) return NextResponse.json({ error: "Missing query ?q=city" }, { status: 400 })

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&appid=${key}&units=metric`
    const r = await fetch(url)
    const data = await r.json()
    if (!r.ok) {
      return NextResponse.json(
        {
          error: data?.message || "Weather fetch failed",
          provider: "openweathermap.org",
          hint: r.status === 401 ? "Invalid OpenWeatherMap API key. Recreate key, put in .env.local, and restart dev server." : undefined,
        },
        { status: r.status },
      )
    }

    return NextResponse.json({
      city: data.name,
      tempC: data.main?.temp,
      feelsLikeC: data.main?.feels_like,
      description: data.weather?.[0]?.description,
      humidity: data.main?.humidity,
      windKph: Math.round((data.wind?.speed || 0) * 3.6),
    })
  } catch (e) {
    console.error("Weather API error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


