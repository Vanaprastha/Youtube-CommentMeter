import type { Comment, SentimentResult } from "./types"
import { analyzeSentimentBatch } from "./huggingface"
import { kv } from "./kv"
import { createHash } from "crypto"

export async function analyzeSentiment(videoId: string, comments: Comment[]): Promise<SentimentResult> {
  try {
    // Create hash of comment IDs for cache key
    const commentIds = comments
      .map((c) => c.id)
      .sort()
      .join(",")
    const hash = createHash("md5").update(commentIds).digest("hex")
    const cacheKey = `sent:${videoId}:${hash}`

    // Check cache first
    const cached = await kv.get(cacheKey)
    if (cached) {
      return cached as SentimentResult
    }

    // Analyze sentiment
    const results = await analyzeSentimentBatch(comments)

    // Calculate summary statistics
    const total = results.length
    const positive = results.filter((r) => r.label === "positive").length
    const neutral = results.filter((r) => r.label === "neutral").length
    const negative = results.filter((r) => r.label === "negative").length

    const averageScore = total > 0 ? results.reduce((sum, r) => sum + r.score, 0) / total : 0

    const sentimentResult: SentimentResult = {
      results,
      summary: {
        total,
        positive,
        neutral,
        negative,
        positivePercent: (positive / total) * 100,
        neutralPercent: (neutral / total) * 100,
        negativePercent: (negative / total) * 100,
        averageScore,
      },
    }

    // Cache for 30 minutes
    await kv.setex(cacheKey, 1800, sentimentResult)

    return sentimentResult
  } catch (error) {
    console.error("Error analyzing sentiment:", error)
    throw error
  }
}
