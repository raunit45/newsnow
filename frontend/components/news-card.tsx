"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookmarkIcon, ExternalLinkIcon, ClockIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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

interface NewsCardProps {
  article: NewsArticle
  isBookmarked: boolean
  onToggleBookmark: () => void
  isLoggedIn: boolean
}

export default function NewsCard({ article, isBookmarked, onToggleBookmark, isLoggedIn }: NewsCardProps) {
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })

  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors group">
      {/* Image */}
      {article.urlToImage && (
        <div
          className="relative h-48 overflow-hidden rounded-t-lg cursor-pointer"
          onClick={() => window.open(article.url, "_blank")}
        >
          <img
            src={article.urlToImage || "/placeholder.svg"}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = "/news-placeholder.png"
            }}
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-black/50 text-white border-0">
              {article.source.name}
            </Badge>
          </div>
        </div>
      )}

      <CardContent className="p-4">
        {/* Title */}
        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
          {article.title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-3 line-clamp-3">{article.description}</p>

        {/* Time */}
        <div className="flex items-center text-gray-500 text-xs mb-3">
          <ClockIcon className="w-3 h-3 mr-1" />
          {timeAgo}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isLoggedIn && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleBookmark}
                className={`${isBookmarked ? "text-red-500 hover:text-red-400" : "text-gray-400 hover:text-red-500"}`}
              >
                <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(article.url, "_blank")}
            className="text-gray-400 hover:text-white"
          >
            <ExternalLinkIcon className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
