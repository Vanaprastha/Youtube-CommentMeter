import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createHash } from "crypto"
import { kvGetJSON, kvSetJSON } from "@/lib/kv-utils"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIP } from "@/lib/utils"
import { extractKeywords } from "@/lib/text-utils"
import { mapSentimentLabel, normalizeSentimentScore } from "@/lib/sentiment-utils"

// ========================
// 📘 SCHEMA DEFINITIONS
// ========================
const SentimentRequestSchema = z.object({
  videoId: z.string().min(1),
  comments: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      publishedAt: z.string(),
      likeCount: z.number(),
    }),
  ),
})

const SentimentItemSchema = z.object({
  id: z.string(),
  label: z.enum(["positive", "neutral", "negative"]),
  score: z.number(),
  likeCount: z.number(),
  publishedAt: z.string(),
})

const SentimentResponseSchema = z.object({
  videoId: z.string(),
  totals: z.object({
    positive: z.number(),
    neutral: z.number(),
    negative: z.number(),
    percentPositive: z.number(),
    percentNeutral: z.number(),
    percentNegative: z.number(),
    avgScore: z.number(),
    weightedAvgScore: z.number(),
  }),
  keywords: z.array(z.string()),
  items: z.array(SentimentItemSchema),
})

type SentimentRequest = z.infer<typeof SentimentRequestSchema>
type SentimentResponse = z.infer<typeof SentimentResponseSchema>
type SentimentItem = z.infer<typeof SentimentItemSchema>

// ========================
// ⚙️ CONFIGURATION
// ========================
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY
const HF_MODEL = "cardiffnlp/twitter-xlm-roberta-base-sentiment"

// 🔧 FIXED: ganti endpoint lama → endpoint baru router.huggingface.co
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`

const REQUEST_TIMEOUT = 15000 // 15 seconds
const MAX_RETRIES = 3
const DELAY_BETWEEN_REQUESTS = 500 // 0.5s

if (!HF_API_KEY) {
  throw new Error("Missing HUGGINGFACE_API_KEY environment variable")
}

// ========================
// 🚀 MAIN API HANDLER
// ========================
export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)

    // 🔒 Rate limit check
    const rateLimitResult = await checkRateLimit("sentiment", clientIP)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    const body = await request.json()
    const { videoId, comments } = SentimentRequestSchema.parse(body)

    console.log(`🤖 Starting individual sentiment analysis for ${comments.length} comments using Twitter XLM-RoBERTa model`)

    // 🧠 Caching logic
    const commentIds = comments.map((c) => c.id).sort().join(",")
    const hash = createHash("md5").update(commentIds).digest("hex")
    const cacheKey = `sent:${videoId}:${hash}`

    const cached = await kvGetJSON<SentimentResponse>(cacheKey)
    if (cached) {
      console.log("✅ Returning cached sentiment analysis")
      return NextResponse.json(cached)
    }

    // 🧩 Analyze each comment
    const sentimentItems = await analyzeSentimentIndividually(comments)

    // 📊 Aggregation
    const total = sentimentItems.length
    const positive = sentimentItems.filter((item) => item.label === "positive").length
    const neutral = sentimentItems.filter((item) => item.label === "neutral").length
    const negative = sentimentItems.filter((item) => item.label === "negative").length

    const avgScore = total > 0 ? sentimentItems.reduce((sum, item) => sum + item.score, 0) / total : 0
    const totalLikes = sentimentItems.reduce((sum, item) => sum + item.likeCount, 0)
    const weightedAvgScore =
      totalLikes > 0
        ? sentimentItems.reduce((sum, item) => sum + item.score * item.likeCount, 0) / totalLikes
        : avgScore

    // 🔤 Keyword extraction
    const allText = comments.map((c) => c.text).join(" ")
    const keywordObjects = extractKeywords(allText, 20)
    const keywords = keywordObjects.map((k) => k.word)

    // ✅ Final response
    const response: SentimentResponse = {
      videoId,
      totals: {
        positive,
        neutral,
        negative,
        percentPositive: total > 0 ? (positive / total) * 100 : 0,
        percentNeutral: total > 0 ? (neutral / total) * 100 : 0,
        percentNegative: total > 0 ? (negative / total) * 100 : 0,
        avgScore,
        weightedAvgScore,
      },
      keywords,
      items: sentimentItems,
    }

    const validatedResponse = SentimentResponseSchema.parse(response)
    await kvSetJSON(cacheKey, validatedResponse, 1800) // Cache 30 min

    console.log(`✅ Sentiment analysis complete: ${positive} positive, ${neutral} neutral, ${negative} negative`)
    return NextResponse.json(validatedResponse)
  } catch (error) {
    console.error("Sentiment API error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request parameters", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to analyze sentiment" }, { status: 500 })
  }
}

// ========================
// 🧠 INDIVIDUAL ANALYSIS
// ========================
async function analyzeSentimentIndividually(comments: SentimentRequest["comments"]): Promise<SentimentItem[]> {
  const results: SentimentItem[] = []
  const total = comments.length

  console.log(`🔄 Processing ${total} comments individually for better accuracy`)

  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i]
    const progress = i + 1

    console.log(`🔄 Processing comment ${progress}/${total}`)

    try {
      const prediction = await fetchSentimentForSingleComment(comment.text)
      const { label, score } = mapSentimentLabel(prediction)

      results.push({
        id: comment.id,
        label,
        score: normalizeSentimentScore(label, score),
        likeCount: comment.likeCount,
        publishedAt: comment.publishedAt,
      })

      if (i < comments.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REQUESTS))
      }
    } catch (error) {
      console.error(`❌ Error processing comment ${progress}:`, error)
      results.push({
        id: comment.id,
        label: "neutral" as const,
        score: 0,
        likeCount: comment.likeCount,
        publishedAt: comment.publishedAt,
      })
    }
  }

  return results
}

// ========================
// 🌐 API CALL TO HUGGING FACE
// ========================
async function fetchSentimentForSingleComment(text: string, retries = MAX_RETRIES): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🚀 Calling Twitter XLM-RoBERTa for single comment (attempt ${attempt}/${retries})`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true, use_cache: false },
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const result = await response.json()
        console.log(`✅ Single comment processed successfully`)
        return Array.isArray(result) ? result[0] : result
      }

      if (response.status === 503) {
        console.log(`⏳ Model is loading, waiting 3 seconds...`)
        await new Promise((resolve) => setTimeout(resolve, 3000))
        continue
      }

      if (response.status === 429) {
        const delay = Math.pow(2, attempt) * 1000
        console.log(`⏳ Rate limited, waiting ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      if (response.status >= 500) {
        if (attempt === retries) throw new Error(`Hugging Face API server error: ${response.status}`)
        const delay = Math.pow(2, attempt) * 1000
        console.log(`⏳ Server error, retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      const errorText = await response.text()
      throw new Error(`Hugging Face API error ${response.status}: ${errorText}`)
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log(`⏰ Request timeout (${REQUEST_TIMEOUT}ms)`)
      }

      if (attempt === retries) throw error

      const delay = Math.pow(2, attempt) * 1000
      console.log(`⏳ Network error, retrying in ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new Error("Max retries exceeded")
}

