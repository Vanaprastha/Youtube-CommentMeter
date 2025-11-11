import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Eye, ThumbsUp, User } from "lucide-react"
import type { VideoMetadata } from "@/lib/types"

interface VideoHeaderProps {
  video: VideoMetadata
}

export function VideoHeader({ video }: VideoHeaderProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <img
              src={video.thumbnail || "/placeholder.svg"}
              alt={video.title}
              className="w-full md:w-80 h-48 object-cover rounded-lg"
            />
          </div>
          <div className="flex-1 space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{video.title}</h1>

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <User className="w-4 h-4" />
              <span className="font-medium">{video.channelTitle}</span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{formatNumber(video.viewCount)} views</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                <span>{formatNumber(video.likeCount)} likes</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(video.publishedAt)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{formatNumber(video.commentCount)} comments</Badge>
              <Badge variant="outline">{video.duration}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
