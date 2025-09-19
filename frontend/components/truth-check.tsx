"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function TruthCheck({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [statement, setStatement] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runCheck = async () => {
    if (!statement.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const r = await fetch("/api/truth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statement }),
      })
      const j = await r.json()
      setResult(j)
    } catch {
      setResult({ error: "Failed to check truth" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle>Check News Truth</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Textarea
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="Paste a news statement to verify..."
            className="bg-slate-700 border-slate-600 text-white min-h-28"
          />
          <Button onClick={runCheck} disabled={loading} className="bg-red-600 hover:bg-red-700">
            {loading ? "Checking..." : "Check Truth"}
          </Button>
          {result && !result.error && (
            <div className="mt-2 space-y-2">
              <div className="text-sm">Verdict: <span className="font-semibold capitalize">{result.verdict}</span></div>
              <div className="text-sm text-gray-300">{result.explanation}</div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-green-400">Truth</span>
                  <span className="text-green-400 font-medium">{result.truthPercent}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded">
                  <div className="h-2 bg-green-500 rounded" style={{ width: `${result.truthPercent || 0}%` }} />
                </div>
                <div className="flex items-center justify-between text-sm mt-3 mb-1">
                  <span className="text-red-400">Lie</span>
                  <span className="text-red-400 font-medium">{result.falsePercent}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded">
                  <div className="h-2 bg-red-500 rounded" style={{ width: `${result.falsePercent || 0}%` }} />
                </div>
              </div>
            </div>
          )}
          {result?.error && <div className="text-red-400 text-sm">{String(result.error)}</div>}
        </div>
      </DialogContent>
    </Dialog>
  )
}


