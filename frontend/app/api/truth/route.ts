import { NextResponse, type NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { statement } = await request.json()
    const geminiKey = process.env.GEMINI_API_KEY
    const newsKey = process.env.NEWS_API_KEY
    if (!geminiKey) return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 })

    // Retrieve recent news context to ground the answer
    let context = ""
    if (newsKey) {
      try {
        const now = new Date()
        const from = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 120) // last 120 days
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
          statement,
        )}&from=${from.toISOString().slice(0, 10)}&language=en&pageSize=8&sortBy=publishedAt&apiKey=${newsKey}`
        const r = await fetch(url)
        const j = await r.json()
        const items: any[] = j?.articles || []
        context = items
          .map(
            (a) =>
              `Title: ${a.title}\nSource: ${a.source?.name}\nPublished: ${a.publishedAt}\nDescription: ${a.description}\nURL: ${a.url}`,
          )
          .join("\n---\n")
      } catch (e) {
        console.error("Truth context fetch failed", e)
      }
    }

    // Fallback context from Wikipedia if NewsAPI returned little
    if (!context) {
      try {
        const search = encodeURIComponent(String(statement).slice(0, 120))
        const s = await fetch(
          `https://en.wikipedia.org/w/api.php?action=opensearch&limit=5&namespace=0&format=json&origin=*&search=${search}`,
        )
        const sj = await s.json()
        const titles: string[] = sj?.[1] || []
        const extracts: string[] = sj?.[2] || []
        context = titles
          .map((t, i) => `Title: ${t}\nSummary: ${extracts?.[i] || ""}`)
          .join("\n---\n")
      } catch (e) {
        console.error("Truth wiki fetch failed", e)
      }
    }

    const today = new Date().toISOString().slice(0, 10)
    const prompt = `Today is ${today}. You are a rigorous fact-checker. Prefer a decisive verdict when context supports it; otherwise return "uncertain". Use date reasoning (events before/after today).
Return strict JSON: { "verdict": "true|false|uncertain", "explanation": string (<=3 sentences), "truthPercent": 0-100 integer, "falsePercent": 0-100 integer } and ensure percentages sum to 100.
Statement: ${statement}

Context:\n${context || "(no articles found)"}`

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" },
        }),
      },
    )
    const data = await resp.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      console.error("Truth model empty response", data)
      return NextResponse.json({ error: "No response from model" }, { status: 502 })
    }

    try {
      const parsed = JSON.parse(text)
      return NextResponse.json(parsed)
    } catch {
      // Fallback parser: infer fields from free text
      const lower = String(text).toLowerCase()
      let verdict: string = lower.includes("true") && !lower.includes("not true") ? "true" : lower.includes("false") ? "false" : "uncertain"
      const perc = (text.match(/(\d{1,3})%/g) || []).map((p) => parseInt(p, 10)).slice(0, 2)
      let truthPercent = 0
      let falsePercent = 0
      if (perc.length === 2) {
        truthPercent = Math.max(perc[0], perc[1])
        falsePercent = 100 - truthPercent
      } else if (perc.length === 1) {
        truthPercent = Math.min(100, perc[0])
        falsePercent = 100 - truthPercent
      } else {
        truthPercent = verdict === "true" ? 70 : verdict === "false" ? 30 : 50
        falsePercent = 100 - truthPercent
      }
      const explanation = text.replace(/\n+/g, " ").slice(0, 400)
      return NextResponse.json({ verdict, explanation, truthPercent, falsePercent })
    }
  } catch (e) {
    console.error("Truth API error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


