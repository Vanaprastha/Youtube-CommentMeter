import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { kvGetJSON, kvSetJSON } from "@/lib/kv-utils"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIP } from "@/lib/utils"

const CommentsQuerySchema = z.object({
  videoId: z
    .string()
    .min(11)
    .max(11)
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid video ID format"),
})

const CommentSchema = z.object({
  id: z.string(),
  textOriginal: z.string(),
  likeCount: z.number(),
  publishedAt: z.string(),
  authorDisplayName: z.string(),
})

const CommentsResponseSchema = z.object({
  videoId: z.string(),
  total: z.number(),
  comments: z.array(CommentSchema),
})

type Comment = z.infer<typeof CommentSchema>
type CommentsResponse = z.infer<typeof CommentsResponseSchema>

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"
const MAX_COMMENTS = 100 // Reduced MAX_COMMENTS from 150 to 100
const MAX_RESULTS_PER_PAGE = 100
const REQUEST_TIMEOUT = 15000
const MAX_RETRIES = 3

if (!YOUTUBE_API_KEY) {
  throw new Error("Missing YOUTUBE_API_KEY environment variable")
}

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)

    // Rate limiting
    const rateLimitResult = await checkRateLimit("comments", clientIP)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const query = CommentsQuerySchema.parse({
      videoId: searchParams.get("videoId"),
    })

    const { videoId } = query
    const cacheKey = `comments:${videoId}`

    // Check cache first
    const cached = await kvGetJSON<CommentsResponse>(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Fetch from YouTube API
    const comments = await fetchYouTubeComments(videoId)

    const response: CommentsResponse = {
      videoId,
      total: comments.length,
      comments,
    }

    // Validate response shape
    const validatedResponse = CommentsResponseSchema.parse(response)

    // Cache for 30 minutes
    await kvSetJSON(cacheKey, validatedResponse, 1800)

    return NextResponse.json(validatedResponse)
  } catch (error) {
    console.error("Comments API error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request parameters", details: error.errors }, { status: 400 })
    }

    if (error instanceof Error) {
      if (error.message.includes("403")) {
        return NextResponse.json(
          { error: "Comments are disabled for this video or the video is private" },
          { status: 403 },
        )
      }
      if (error.message.includes("404")) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 })
      }
    }

    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

async function fetchYouTubeComments(videoId: string): Promise<Comment[]> {
  const comments: Comment[] = []
  let nextPageToken: string | undefined

  while (comments.length < MAX_COMMENTS) {
    const url = new URL(`${YOUTUBE_API_BASE}/commentThreads`)
    url.searchParams.set("part", "snippet,replies")
    url.searchParams.set("videoId", videoId)
    url.searchParams.set("order", "time")
    url.searchParams.set("textFormat", "plainText")
    url.searchParams.set("maxResults", MAX_RESULTS_PER_PAGE.toString())
    url.searchParams.set("key", YOUTUBE_API_KEY)

    if (nextPageToken) {
      url.searchParams.set("pageToken", nextPageToken)
    }

    const data = await fetchWithRetry(url.toString())

    if (!data.items || data.items.length === 0) break

    for (const item of data.items) {
      if (comments.length >= MAX_COMMENTS) break

      const snippet = item.snippet.topLevelComment.snippet
      comments.push({
        id: item.snippet.topLevelComment.id,
        textOriginal: snippet.textOriginal,
        likeCount: snippet.likeCount || 0,
        publishedAt: snippet.publishedAt,
        authorDisplayName: snippet.authorDisplayName,
      })
    }

    nextPageToken = data.nextPageToken
    if (!nextPageToken) break

    // Add delay to respect rate limits
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return comments
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      const response = await fetch(url, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        return await response.json()
      }

      if (response.status === 429 || response.status >= 500) {
        if (attempt === retries) {
          throw new Error(`YouTube API error: ${response.status}`)
        }
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      throw new Error(`YouTube API error: ${response.status}`)
    } catch (error) {
      if (attempt === retries) {
        throw error
      }
      // Exponential backoff for network errors
      const delay = Math.pow(2, attempt) * 1000
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new Error("Max retries exceeded")
}
