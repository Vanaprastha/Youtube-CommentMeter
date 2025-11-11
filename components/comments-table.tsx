"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThumbsUp, Calendar, Filter } from "lucide-react"

interface CommentsTableProps {
  comments: Array<{
    id: string
    textOriginal: string
    authorDisplayName: string
    likeCount: number
    publishedAt: string
  }>
  sentiment: {
    items: Array<{
      id: string
      label: "positive" | "neutral" | "negative"
      score: number
    }>
  }
}

export function CommentsTable({ comments, sentiment }: CommentsTableProps) {
  const [filter, setFilter] = useState<"all" | "positive" | "neutral" | "negative">("all")
  const [minLikes, setMinLikes] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const getSentimentBadge = (commentId: string) => {
    const sentimentData = sentiment.items.find((r) => r.id === commentId)
    if (!sentimentData) return null

    const { label, score } = sentimentData
    const variant = label === "positive" ? "default" : label === "negative" ? "destructive" : "secondary"

    return (
      <Badge variant={variant} className="text-xs">
        {label} ({score.toFixed(2)})
      </Badge>
    )
  }

  const filteredComments = comments.filter((comment) => {
    const sentimentData = sentiment.items.find((r) => r.id === comment.id)
    const sentimentLabel = sentimentData?.label || "neutral"

    const matchesFilter = filter === "all" || sentimentLabel === filter
    const matchesLikes = comment.likeCount >= minLikes

    return matchesFilter && matchesLikes
  })

  const totalPages = Math.ceil(filteredComments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedComments = filteredComments.slice(startIndex, startIndex + itemsPerPage)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments Analysis</CardTitle>
        <CardDescription>Detailed view of comments with sentiment analysis</CardDescription>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Comments</SelectItem>
              <SelectItem value="positive">Positive Only</SelectItem>
              <SelectItem value="neutral">Neutral Only</SelectItem>
              <SelectItem value="negative">Negative Only</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Input
              type="number"
              placeholder="Min likes"
              value={minLikes}
              onChange={(e) => setMinLikes(Number(e.target.value) || 0)}
              className="w-32"
              min="0"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {paginatedComments.map((comment) => (
            <div key={comment.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">{comment.authorDisplayName}</span>
                    {getSentimentBadge(comment.id)}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{comment.textOriginal}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{comment.likeCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(comment.publishedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredComments.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">No comments match the current filters</div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
