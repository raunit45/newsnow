"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HeartIcon, UserIcon, LogOutIcon, MenuIcon, XIcon, ShieldCheck } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import AuthModal from "@/components/auth-modal"
import NewsCard from "@/components/news-card"
import FavoritesSidebar from "@/components/favorites-sidebar"
import Chatbot from "@/components/chatbot"
import BottomDock from "@/components/bottom-dock"
import TruthCheck from "@/components/truth-check"

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

export default function HomePage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("general")
  const [search, setSearch] = useState("")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [loggedIn, setLoggedIn] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [showSidebar, setShowSidebar] = useState(false)
  const [showTruth, setShowTruth] = useState(false)
  const [showLanding, setShowLanding] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  const categories = ["general", "business", "technology", "entertainment", "health", "science", "sports"]

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("authToken")
    const email = localStorage.getItem("userEmail")
    const name = localStorage.getItem("userFullname")
    if (token && (email || name)) {
      setLoggedIn(true)
      setDisplayName(name || email || "")
      // Load user preferences
      const savedBookmarks = localStorage.getItem("bookmarks")
      const savedFavorites = localStorage.getItem("favorites")
      if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks))
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  useEffect(() => {
    // Check URL parameters first
    const view = searchParams?.get("view")
    if (view === "app" || view === "news") {
      setShowLanding(false)
      return
    }
    
    // For direct access, show news immediately instead of landing
    // Users can still access landing by going to ?view=landing
    const landing = searchParams?.get("landing")
    if (landing === "true") {
      setShowLanding(true)
    } else {
      setShowLanding(false) // Show news by default
    }
  }, [searchParams, loggedIn])

  useEffect(() => {
    fetchNews()
  }, [selectedCategory])

  const fetchNews = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/news?category=${selectedCategory}&pageSize=50`)
      const data = await response.json()
      console.log('🔥 REAL NEWS API Response:', data)
      
      if (data.articles && Array.isArray(data.articles)) {
        setArticles(
          data.articles.map((article: any, index: number) => ({
            ...article,
            id: `${article.url}-${index}`,
            category: selectedCategory,
          })),
        )
        console.log('✅ REAL Articles loaded:', data.articles.length)
      } else if (data.error) {
        console.error('❌ API Error:', data.error, data.message)
        setArticles([])
      } else {
        console.log('❌ No articles in response')
        setArticles([])
      }
    } catch (error) {
      console.error('💥 Error fetching REAL news:', error)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  const filteredArticles = articles.filter((a) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      a.title?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.source?.name?.toLowerCase().includes(q)
    )
  })

  const handleLogin = (nameOrEmail: string) => {
    setLoggedIn(true)
    setDisplayName(nameOrEmail)
    setShowAuthModal(false)
  }

  const handleLogout = () => {
    localStorage.clear()
    setLoggedIn(false)
    setDisplayName("")
    setBookmarks([])
    setFavorites([])
  }

  const toggleBookmark = (articleId: string) => {
    const article = articles.find((a) => a.id === articleId)
    if (!article) return

    const newBookmarks = bookmarks.includes(articleId)
      ? bookmarks.filter((id) => id !== articleId)
      : [...bookmarks, articleId]

    setBookmarks(newBookmarks)
    localStorage.setItem("bookmarks", JSON.stringify(newBookmarks))

    const savedArticles = localStorage.getItem("bookmarkedArticles")
    let bookmarkedArticles = savedArticles ? JSON.parse(savedArticles) : []

    if (newBookmarks.includes(articleId)) {
      if (!bookmarkedArticles.find((a: NewsArticle) => a.id === articleId)) {
        bookmarkedArticles.push(article)
      }
    } else {
      bookmarkedArticles = bookmarkedArticles.filter((a: NewsArticle) => a.id !== articleId)
    }

    localStorage.setItem("bookmarkedArticles", JSON.stringify(bookmarkedArticles))
  }

  const toggleFavorite = (category: string) => {
    const newFavorites = favorites.includes(category)
      ? favorites.filter((cat) => cat !== category)
      : [...favorites, category]
    setFavorites(newFavorites)
    localStorage.setItem("favorites", JSON.stringify(newFavorites))
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setShowSidebar(false)
  }

  const navToCategory = (label: string) => {
    switch (label) {
      case "PODCAST":
      case "POLITICS":
      case "INVESTIGATIONS":
      case "MORE":
        return "general"
      case "TECH":
      case "CRYPTO":
        return "technology"
      case "MARKETS":
      case "GOLD":
        return "business"
      case "SPORTS":
        return "sports"
      default:
        return "general"
    }
  }

  const openChat = () => {
    window.dispatchEvent(new CustomEvent("open-chatbot"))
    if (!loggedIn) setShowLanding(false)
  }

  if (showLanding) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#eef2ff] via-white to-white text-slate-800">
        {/* Hero */}
        <header className="border-b border-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 grid place-items-center text-white font-bold">N</div>
              <span className="font-semibold text-xl">NewsNow</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-slate-600">
              <span className="px-3 py-1 rounded-full bg-slate-100">Home</span>
              <button onClick={() => setShowLanding(false)} className="hover:text-slate-900">News</button>
              <button onClick={() => openChat()} className="hover:text-slate-900">Chatbot</button>
              <button onClick={() => { setAuthMode("login"); setShowAuthModal(true); }} className="hover:text-slate-900">Sign In</button>
            </nav>
          </div>
        </header>

        <main>
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-indigo-600 to-violet-600 text-transparent bg-clip-text">NewsNow</h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600">Your gateway to the world - Real-time news, weather updates, and intelligent conversations in one beautiful platform</p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <button onClick={() => setShowLanding(false)} className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md hover:opacity-95">Explore News</button>
              <button onClick={() => openChat()} className="px-6 py-3 rounded-full bg-white text-slate-700 shadow border border-slate-200 hover:bg-slate-50">Try Chatbot</button>
            </div>
          </section>

          {/* Features */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {[
              { title: "Latest News", desc: "Stay updated with breaking news, trending stories, and global events from trusted sources around the world." },
              { title: "Weather Forecast", desc: "Get accurate weather forecasts, current conditions, and weather alerts for any location worldwide." },
              { title: "AI Chatbot", desc: "Chat with our intelligent assistant for quick answers, recommendations, and helpful information." },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </section>

          {/* Stats */}
          <section className="bg-gradient-to-r from-indigo-600 to-violet-600">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-white">
              <div className="text-center">
                <div className="text-4xl font-bold">24/7</div>
                <div className="opacity-90">Real-time Updates</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">100+</div>
                <div className="opacity-90">News Sources</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">∞</div>
                <div className="opacity-90">Possibilities</div>
              </div>
            </div>
          </section>
        </main>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          onLogin={handleLogin}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Mobile Menu */}
            <div className="flex items-center space-x-3">
              {loggedIn && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="lg:hidden text-gray-300 hover:text-white"
                >
                  {showSidebar ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
                </Button>
              )}
              <div className="bg-red-600 px-3 py-1 rounded">
                <span className="text-white font-bold text-lg">NewsNow</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => {setShowLanding(false); setSelectedCategory('general');}}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                NEWS
              </button>
              <button
                onClick={() => router.push('/weather')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                WEATHER
              </button>
              <button
                onClick={() => router.push('/chat')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                CHAT
              </button>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {loggedIn ? (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-300 text-sm hidden sm:block">Hello, {displayName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTruth(true)}
                    className="text-gray-300 hover:text-white"
                  >
                    <ShieldCheck className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Check Truth</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-300 hover:text-white">
                    <LogOutIcon className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAuthMode("login")
                      setShowAuthModal(true)
                    }}
                    className="text-gray-300 hover:text-white"
                  >
                    <UserIcon className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowTruth(true)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Check Truth
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Category Navigation */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-3 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "bg-red-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                <span className="capitalize">{category}</span>
                {favorites.includes(category) && <HeartIcon className="w-3 h-3 fill-current" />}
              </button>
            ))}
            <div className="ml-auto flex-1 min-w-[220px] max-w-sm">
              <input
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                placeholder="Search articles…"
                className="w-full rounded-md bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          {loggedIn && (
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <FavoritesSidebar
                favorites={favorites}
                onCategorySelect={handleCategorySelect}
                selectedCategory={selectedCategory}
                onToggleFavorite={toggleFavorite}
                bookmarkCount={bookmarks.length}
                onViewBookmarks={() => router.push("/bookmarks")}
              />
            </aside>
          )}

          {/* Mobile Sidebar Overlay */}
          {loggedIn && showSidebar && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowSidebar(false)}>
              <div
                className="fixed left-0 top-0 h-full w-80 bg-slate-900 p-4 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white text-lg font-semibold">Menu</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSidebar(false)}
                    className="text-gray-300 hover:text-white"
                  >
                    <XIcon className="w-5 h-5" />
                  </Button>
                </div>
                <FavoritesSidebar
                  favorites={favorites}
                  onCategorySelect={handleCategorySelect}
                  selectedCategory={selectedCategory}
                  onToggleFavorite={toggleFavorite}
                  bookmarkCount={bookmarks.length}
                  onViewBookmarks={() => {
                    router.push("/bookmarks")
                    setShowSidebar(false)
                  }}
                />
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1">
            {/* Category Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-white capitalize">{selectedCategory} News</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(selectedCategory)}
                  className={`${
                    favorites.includes(selectedCategory)
                      ? "text-red-500 hover:text-red-400"
                      : "text-gray-400 hover:text-red-500"
                  }`}
                >
                  <HeartIcon className={`w-4 h-4 ${favorites.includes(selectedCategory) ? "fill-current" : ""}`} />
                </Button>
              </div>
              <Badge variant="secondary" className="bg-slate-700 text-gray-300">
                {articles.length} articles
              </Badge>
            </div>

            {/* News Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-slate-800 border-slate-700 animate-pulse">
                    <div className="h-48 bg-slate-700 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-slate-700 rounded mb-2"></div>
                      <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    isBookmarked={bookmarks.includes(article.id)}
                    onToggleBookmark={() => toggleBookmark(article.id)}
                    isLoggedIn={loggedIn}
                  />
                ))}
              </div>
            )}

            {articles.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-400">No articles found for this category.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Chatbot Floating Widget (only when logged in) */}
      {loggedIn && <Chatbot fullname={displayName} />}

      {/* Bottom Dock with News/Weather/Chat after sign-in */}
      {loggedIn && <BottomDock visible={true} />}

      {/* Truth Check modal */}
      <TruthCheck open={showTruth} onOpenChange={setShowTruth} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onLogin={handleLogin}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />
    </div>
  )
}
