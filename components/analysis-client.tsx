"use client"

import { useEffect, useState } from "react"
import { VideoHeader } from "@/components/video-header"
import { KPICards } from "@/components/kpi-cards"
import { SentimentChart } from "@/components/sentiment-chart"
import { TimelineChart } from "@/components/timeline-chart"
import { KeywordsCloud } from "@/components/keywords-cloud"
import { CommentsTable } from "@/components/comments-table"
import { ExportCSV } from "@/components/export-csv"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import type { VideoMetadata } from "@/lib/types"

interface AnalysisClientProps {
  videoId: string
}

export function AnalysisClient({ videoId }: AnalysisClientProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [sentiment, setSentiment] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching video metadata for:", videoId)
        const videoResponse = await fetch(`/api/video?videoId=${videoId}`)

        if (!videoResponse.ok) {
          const errorData = await videoResponse.json()
          throw new Error(errorData.error || "Failed to fetch video metadata")
        }

        const videoMetadata = await videoResponse.json()
        console.log("Video metadata fetched:", videoMetadata.title)
        setVideoData(videoMetadata)

        // Step 1: Fetch comments
        console.log("Fetching comments for video:", videoId)
        const commentsResponse = await fetch(`/api/comments?videoId=${videoId}`)

        if (!commentsResponse.ok) {
          const errorData = await commentsResponse.json()
          throw new Error(errorData.error || "Failed to fetch comments")
        }

        const commentsData = await commentsResponse.json()
        console.log("Comments fetched:", commentsData.total)
        setComments(commentsData.comments)

        // Step 2: Analyze sentiment if we have comments
        if (commentsData.comments.length > 0) {
          console.log("Analyzing sentiment...")
          const sentimentResponse = await fetch("/api/sentiment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              videoId,
              comments: commentsData.comments.map((c: any) => ({
                id: c.id,
                text: c.textOriginal,
                publishedAt: c.publishedAt,
                likeCount: c.likeCount,
              })),
            }),
          })

          if (!sentimentResponse.ok) {
            const errorData = await sentimentResponse.json()
            throw new Error(errorData.error || "Failed to analyze sentiment")
          }

          const sentimentData = await sentimentResponse.json()
          console.log("Sentiment analysis complete:", sentimentData.totals)
          setSentiment(sentimentData)
        }
      } catch (err) {
        console.error("Error loading analysis:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [videoId])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading analysis...</p>
            <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Error loading analysis</p>
            <p className="text-sm text-gray-500 mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!videoData || comments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500">No comments available for analysis</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <VideoHeader video={videoData} />

      {sentiment && (
        <>
          <KPICards sentiment={sentiment} />

          <div className="grid lg:grid-cols-2 gap-8">
            <SentimentChart sentiment={sentiment} />
            <TimelineChart comments={comments} sentiment={sentiment} />
          </div>

          <KeywordsCloud comments={comments} />

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Comments Analysis</h2>
            <ExportCSV items={sentiment.items} comments={comments} videoId={videoId} />
          </div>

          <CommentsTable comments={comments} sentiment={sentiment} />
        </>
      )}
    </div>
  )
}
