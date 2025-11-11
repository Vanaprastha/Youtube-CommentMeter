import type { VideoMetadata, Comment } from "./types"
import { kv } from "./kv"

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"

if (!YOUTUBE_API_KEY) {
  throw new Error("Missing YOUTUBE_API_KEY environment variable")
}

export async function getVideoMetadata(videoId: string): Promise<VideoMetadata | null> {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`,
    )

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return null
    }

    const video = data.items[0]
    const snippet = video.snippet
    const statistics = video.statistics
    const contentDetails = video.contentDetails

    return {
      id: video.id,
      title: snippet.title,
      description: snippet.description,
      channelTitle: snippet.channelTitle,
      channelId: snippet.channelId,
      publishedAt: snippet.publishedAt,
      thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.default.url,
      duration: formatDuration(contentDetails.duration),
      viewCount: Number.parseInt(statistics.viewCount || "0"),
      likeCount: Number.parseInt(statistics.likeCount || "0"),
      commentCount: Number.parseInt(statistics.commentCount || "0"),
    }
  } catch (error) {
    console.error("Error fetching video metadata:", error)
    return null
  }
}

export async function fetchYouTubeComments(videoId: string, maxResults = 100): Promise<Comment[]> {
  const comments: Comment[] = []
  let nextPageToken: string | undefined

  try {
    while (comments.length < maxResults) {
      const url = new URL(`${YOUTUBE_API_BASE}/commentThreads`)
      url.searchParams.set("part", "snippet")
      url.searchParams.set("videoId", videoId)
      url.searchParams.set("order", "relevance")
      url.searchParams.set("maxResults", "100")
      url.searchParams.set("key", YOUTUBE_API_KEY)

      if (nextPageToken) {
        url.searchParams.set("pageToken", nextPageToken)
      }

      const response = await fetch(url.toString())

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Comments are disabled for this video")
        }
        throw new Error(`YouTube API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.items) break

      for (const item of data.items) {
        if (comments.length >= maxResults) break

        const comment = item.snippet.topLevelComment.snippet
        comments.push({
          id: item.snippet.topLevelComment.id,
          textOriginal: comment.textOriginal,
          authorDisplayName: comment.authorDisplayName,
          authorProfileImageUrl: comment.authorProfileImageUrl,
          likeCount: comment.likeCount || 0,
          publishedAt: comment.publishedAt,
          updatedAt: comment.updatedAt,
        })
      }

      nextPageToken = data.nextPageToken
      if (!nextPageToken) break

      // Add delay to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    return comments
  } catch (error) {
    console.error("Error fetching YouTube comments:", error)
    throw error
  }
}

export async function getCachedComments(videoId: string): Promise<Comment[] | null> {
  try {
    const cached = await kv.get(`comments:${videoId}`)
    return cached as Comment[] | null
  } catch (error) {
    console.error("Error getting cached comments:", error)
    return null
  }
}

export async function getCachedSentiment(videoId: string, comments: Comment[]) {
  try {
    const commentIds = comments
      .map((c) => c.id)
      .sort()
      .join(",")
    const hash = require("crypto").createHash("md5").update(commentIds).digest("hex")
    const cached = await kv.get(`sent:${videoId}:${hash}`)
    return cached
  } catch (error) {
    console.error("Error getting cached sentiment:", error)
    return null
  }
}

function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return duration

  const hours = Number.parseInt(match[1] || "0")
  const minutes = Number.parseInt(match[2] || "0")
  const seconds = Number.parseInt(match[3] || "0")

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
