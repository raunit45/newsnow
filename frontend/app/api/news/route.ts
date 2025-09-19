import { type NextRequest, NextResponse } from "next/server"

const NEWS_API_KEY = process.env.NEWS_API_KEY as string

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") || "general"

  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${NEWS_API_KEY}`,
      {
        headers: {
          "User-Agent": "NewsNow/1.0",
        },
      },
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Failed to fetch news" }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("News API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
