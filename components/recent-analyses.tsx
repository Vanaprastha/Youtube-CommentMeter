"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Clock } from "lucide-react"
import Link from "next/link"

interface RecentAnalysis {
  videoId: string
  title: string
  analyzedAt: string
  commentCount: number
}

export function RecentAnalyses() {
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([])

  useEffect(() => {
    const loadRecentAnalyses = async () => {
      try {
        // TODO: Implement actual recent analyses fetching from KV store
        // For now, show empty state instead of mock data
        setRecentAnalyses([])
      } catch (error) {
        console.error("Failed to load recent analyses:", error)
        setRecentAnalyses([])
      }
    }

    loadRecentAnalyses()
  }, [])

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const analyzed = new Date(dateString)
    const diffMs = now.getTime() - analyzed.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMins > 0) return `${diffMins}m ago`
    return "Just now"
  }

  if (recentAnalyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Analyses
          </CardTitle>
          <CardDescription>No recent analyses available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            There are no recently analyzed videos to display.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Analyses
        </CardTitle>
        <CardDescription>Previously analyzed videos (cached for 30 minutes)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentAnalyses.map((analysis) => (
            <div key={analysis.videoId} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1 line-clamp-1">{analysis.title}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatTimeAgo(analysis.analyzedAt)}</span>
                  <Badge variant="outline" className="text-xs">
                    {analysis.commentCount} comments
                  </Badge>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/analyze/${analysis.videoId}`}>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
