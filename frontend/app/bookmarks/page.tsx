"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookmarkIcon, ArrowLeftIcon, TrashIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import NewsCard from "@/components/news-card"

interface NewsArticle {
  id: string
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  source: {
    name: string
  }
  category?: string
}

export default function BookmarksPage() {
  const [bookmarkedArticles, setBookmarkedArticles] = useState<NewsArticle[]>([])
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [loggedIn, setLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/")
      return
    }

    setLoggedIn(true)

    // Load bookmarked articles from localStorage
    const savedBookmarks = localStorage.getItem("bookmarks")
    const savedArticles = localStorage.getItem("bookmarkedArticles")

    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks))
    }

    if (savedArticles) {
      setBookmarkedArticles(JSON.parse(savedArticles))
    }
  }, [router])

  const removeBookmark = (articleId: string) => {
    const newBookmarks = bookmarks.filter((id) => id !== articleId)
    const newArticles = bookmarkedArticles.filter((article) => article.id !== articleId)

    setBookmarks(newBookmarks)
    setBookmarkedArticles(newArticles)

    localStorage.setItem("bookmarks", JSON.stringify(newBookmarks))
    localStorage.setItem("bookmarkedArticles", JSON.stringify(newArticles))
  }

  const clearAllBookmarks = () => {
    if (confirm("Are you sure you want to remove all bookmarks?")) {
      setBookmarks([])
      setBookmarkedArticles([])
      localStorage.removeItem("bookmarks")
      localStorage.removeItem("bookmarkedArticles")
    }
  }

  if (!loggedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to News
              </Button>
              <div className="bg-red-600 px-3 py-1 rounded">
                <span className="text-white font-bold text-lg">NewsNow</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-slate-700 text-gray-300">
                {bookmarkedArticles.length} bookmarks
              </Badge>
              {bookmarkedArticles.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllBookmarks}
                  className="text-red-400 hover:text-red-300"
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-3 mb-6">
          <BookmarkIcon className="w-6 h-6 text-red-500 fill-current" />
          <h1 className="text-2xl font-bold text-white">Your Bookmarks</h1>
        </div>

        {bookmarkedArticles.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-12 text-center">
              <BookmarkIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No bookmarks yet</h3>
              <p className="text-gray-500 mb-6">Start bookmarking articles you want to read later</p>
              <Button onClick={() => router.push("/")} className="bg-red-600 hover:bg-red-700 text-white">
                Browse News
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedArticles.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                isBookmarked={true}
                onToggleBookmark={() => removeBookmark(article.id)}
                isLoggedIn={loggedIn}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
