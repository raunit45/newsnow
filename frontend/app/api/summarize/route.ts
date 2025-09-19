import { NextResponse, type NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json()
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 })
    }

    const prompt = `Summarize in 2-3 sentences. Then provide two percentages that sum to 100 for how true vs false this seems. Output strictly in JSON with keys: summary, truthPercent, falsePercent. Title: "${title}". Description: ${description}`

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    )

    const data = await resp.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined
    if (!text) {
      return NextResponse.json({ error: "No content from model" }, { status: 502 })
    }

    let summary = ""
    let truthPercent = 0
    let falsePercent = 0

    try {
      const parsed = JSON.parse(text)
      summary = parsed.summary || ""
      truthPercent = Number(parsed.truthPercent) || 0
      falsePercent = Number(parsed.falsePercent) || Math.max(0, 100 - truthPercent)
    } catch {
      // Fallback: parse percentages from free-form text
      summary = text.replace(/\n/g, " ").slice(0, 600)
      const matches = (text.match(/(\d{1,3})%/g) || []).map((m) => parseInt(m, 10))
      if (matches.length >= 2) {
        truthPercent = Math.min(100, Math.max(matches[0], matches[1]))
        falsePercent = 100 - truthPercent
      }
    }

    return NextResponse.json({ summary, truthPercent, falsePercent })
  } catch (err) {
    console.error("Summarize API error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


