"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TimelineChartProps {
  comments: any[]
  sentiment: any
}

export function TimelineChart({ comments, sentiment }: TimelineChartProps) {
  // Simple timeline tanpa recharts
  const timelineData = comments.slice(0, 10) // Ambil 10 comment terbaru

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Comments Timeline</CardTitle>
        <CardDescription>Latest comments with sentiment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {timelineData.map((comment, index) => {
            const sentimentData = sentiment.results?.find((r: any) => r.commentId === comment.id)
            const sentimentColor =
              sentimentData?.label === "positive"
                ? "bg-green-100 text-green-800"
                : sentimentData?.label === "negative"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"

            return (
              <div key={comment.id} className="flex items-center gap-3 p-2 rounded-lg border">
                <div className={`px-2 py-1 rounded text-xs font-medium ${sentimentColor}`}>
                  {sentimentData?.label || "neutral"}
                </div>
                <div className="flex-1 text-sm text-gray-600 truncate">{comment.textOriginal}</div>
                <div className="text-xs text-gray-400">{new Date(comment.publishedAt).toLocaleDateString()}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
