import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ThemeToggle from "@/components/theme-toggle"
import PageTransition from "@/components/page-transition"

export const metadata: Metadata = {
  title: "NewsNow - Stay Informed with Latest News",
  description: "Your modern news destination with AI-powered summaries, bookmarks, and personalized categories",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="fixed right-3 top-3 z-50"><ThemeToggle /></div>
          <PageTransition>
            <Suspense fallback={null}>{children}</Suspense>
          </PageTransition>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
