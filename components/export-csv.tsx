"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { generateCSV, downloadCSV } from "@/lib/csv-utils"

interface ExportCSVProps {
  items: Array<{
    id: string
    label: string
    score: number
    likeCount: number
    publishedAt: string
  }>
  comments: Array<{
    id: string
    textOriginal: string
  }>
  videoId: string
}

export function ExportCSV({ items, comments, videoId }: ExportCSVProps) {
  const exportToCSV = () => {
    const csvData = items.map((item) => {
      const comment = comments.find((c) => c.id === item.id)
      return {
        id: item.id,
        text: comment?.textOriginal || "",
        likeCount: item.likeCount,
        publishedAt: item.publishedAt,
        sentimentLabel: item.label,
        sentimentScore: item.score,
      }
    })

    const csvContent = generateCSV(csvData)
    const filename = `youtube-sentiment-${videoId}-${new Date().toISOString().split("T")[0]}.csv`

    downloadCSV(csvContent, filename)
  }

  return (
    <Button onClick={exportToCSV} variant="outline" className="gap-2 bg-transparent">
      <Download className="w-4 h-4" />
      Export CSV
    </Button>
  )
}
