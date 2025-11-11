import type { Comment, SentimentAnalysis } from "./types"

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY
const HF_MODEL = "cardiffnlp/twitter-xlm-roberta-base-sentiment"
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`

if (!HF_API_KEY) {
  throw new Error("Missing HUGGINGFACE_API_KEY environment variable")
}

interface HuggingFaceResponse {
  label: string
  score: number
}

export async function analyzeSentimentBatch(comments: Comment[]): Promise<SentimentAnalysis[]> {
  const results: SentimentAnalysis[] = []
  const batchSize = 25 // Smaller batch size for Twitter XLM-RoBERTa model

  for (let i = 0; i < comments.length; i += batchSize) {
    const batch = comments.slice(i, i + batchSize)
    const batchResults = await processBatch(batch)
    results.push(...batchResults)

    // Add delay between batches to respect rate limits
    if (i + batchSize < comments.length) {
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Longer delay for stability
    }
  }

  return results
}

async function processBatch(comments: Comment[]): Promise<SentimentAnalysis[]> {
  const texts = comments.map((c) => c.textOriginal)

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 20000) // Longer timeout

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: texts,
        options: {
          wait_for_model: true,
          use_cache: false, // Always get fresh predictions
        },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limited, wait and retry
        await new Promise((resolve) => setTimeout(resolve, 5000)) // Longer wait for rate limits
        return processBatch(comments)
      }
      if (response.status === 503) {
        // Model loading, wait and retry
        await new Promise((resolve) => setTimeout(resolve, 10000))
        return processBatch(comments)
      }
      throw new Error(`Hugging Face API error: ${response.status}`)
    }

    const data = await response.json()

    return comments.map((comment, index) => {
      const result = data[index]
      if (!result || !Array.isArray(result)) {
        console.warn(`No valid prediction for comment ${comment.id}, using neutral`)
        return {
          commentId: comment.id,
          label: "neutral" as const,
          score: 0,
          confidence: 0,
        }
      }

      // Find the highest confidence prediction
      const prediction = result.reduce((prev, curr) => (curr.score > prev.score ? curr : prev))

      const label = normalizeSentimentLabel(prediction.label)
      const score = mapSentimentToScore(label, prediction.score)

      return {
        commentId: comment.id,
        label,
        score,
        confidence: prediction.score,
      }
    })
  } catch (error) {
    console.error("Error in sentiment analysis batch:", error)
    throw error
  }
}

function normalizeSentimentLabel(label: string): "positive" | "neutral" | "negative" {
  const normalized = label.toLowerCase()
  if (normalized === "positive") return "positive"
  if (normalized === "negative") return "negative"
  if (normalized === "neutral") return "neutral"

  // Fallback for partial matches
  if (normalized.includes("positive")) return "positive"
  if (normalized.includes("negative")) return "negative"

  console.warn(`Unknown label from model: ${label}, defaulting to neutral`)
  return "neutral"
}

function mapSentimentToScore(label: "positive" | "neutral" | "negative", confidence: number): number {
  switch (label) {
    case "positive":
      return confidence
    case "negative":
      return -confidence
    case "neutral":
    default:
      return 0
  }
}

