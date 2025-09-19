import { NextResponse, type NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    const newsKey = process.env.NEWS_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 })

    // If user asks for weather like: "weather in <city>" or "how is weather in <city>"
    const weatherMatch = /weather\s+(?:in|at|for)?\s*([a-zA-Z\s]+)$/i.exec(String(query || ""))
    if (weatherMatch) {
      const city = weatherMatch[1].trim()
      const base = new URL(request.url).origin
      const w = await fetch(`${base}/api/weather?q=${encodeURIComponent(city)}`)
      const jw = await w.json()
      if (w.ok) {
        const answer = `Weather in ${jw.city}: ${jw.tempC}°C (feels ${jw.feelsLikeC}°C), ${jw.description}. Humidity ${jw.humidity}%, Wind ${jw.windKph} km/h.`
        return NextResponse.json({ answer })
      }
    }

    // Fetch a few relevant headlines to use as context
    let context = ""
    try {
      if (newsKey && typeof query === "string") {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=5&language=en&apiKey=${newsKey}`
        const r = await fetch(url)
        const j = await r.json()
        const items: any[] = j?.articles || []
        context = items
          .map((a) => `Title: ${a.title}\nSource: ${a.source?.name}\nPublished: ${a.publishedAt}\nDesc: ${a.description}`)
          .join("\n---\n")
      }
    } catch {}

    const prompt = `You are a concise news assistant. Use the context if helpful. If context is empty, still answer from current events knowledge and say when uncertain. Keep answers under 6 sentences.\nUser question: ${query}\n\nContext:\n${context}`

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    )
    const data = await resp.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
    if (!text) {
      console.error("Chat model empty response", data)
    }
    return NextResponse.json({ answer: text || "I couldn't find an answer." })
  } catch (e) {
    console.error("Chat API error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


