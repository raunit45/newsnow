"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HeartIcon, BookmarkIcon, TrendingUpIcon } from "lucide-react"

interface FavoritesSidebarProps {
  favorites: string[]
  onCategorySelect: (category: string) => void
  selectedCategory: string
  onToggleFavorite: (category: string) => void
  bookmarkCount: number
  onViewBookmarks: () => void
}

const categoryIcons: Record<string, React.ReactNode> = {
  general: <TrendingUpIcon className="w-4 h-4" />,
  business: <TrendingUpIcon className="w-4 h-4" />,
  technology: <TrendingUpIcon className="w-4 h-4" />,
  entertainment: <TrendingUpIcon className="w-4 h-4" />,
  health: <TrendingUpIcon className="w-4 h-4" />,
  science: <TrendingUpIcon className="w-4 h-4" />,
  sports: <TrendingUpIcon className="w-4 h-4" />,
}

export default function FavoritesSidebar({
  favorites,
  onCategorySelect,
  selectedCategory,
  onToggleFavorite,
  bookmarkCount,
  onViewBookmarks,
}: FavoritesSidebarProps) {
  return (
    <div className="space-y-4">
      {/* Bookmarks Card */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center">
            <BookmarkIcon className="w-5 h-5 mr-2 text-red-500" />
            Bookmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="ghost"
            onClick={onViewBookmarks}
            className="w-full justify-between text-gray-300 hover:text-white hover:bg-slate-700"
          >
            <span>View Saved Articles</span>
            <Badge variant="secondary" className="bg-slate-700 text-gray-300">
              {bookmarkCount}
            </Badge>
          </Button>
        </CardContent>
      </Card>

      {/* Favorite Categories */}
      {favorites.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center">
              <HeartIcon className="w-5 h-5 mr-2 text-red-500 fill-current" />
              Favorite Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {favorites.map((category) => (
              <div key={category} className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => onCategorySelect(category)}
                  className={`flex-1 justify-start text-left ${
                    selectedCategory === category
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "text-gray-300 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  {categoryIcons[category]}
                  <span className="ml-2 capitalize">{category}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleFavorite(category)}
                  className="text-red-500 hover:text-red-400 ml-2"
                >
                  <HeartIcon className="w-4 h-4 fill-current" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Bookmarks</span>
            <Badge variant="secondary" className="bg-slate-700 text-gray-300">
              {bookmarkCount}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Favorite Categories</span>
            <Badge variant="secondary" className="bg-slate-700 text-gray-300">
              {favorites.length}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
