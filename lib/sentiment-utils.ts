interface HuggingFaceResult {
  label?: string
  score?: number
}

interface SentimentMapping {
  label: "positive" | "neutral" | "negative"
  score: number
}

export function mapSentimentLabel(result: HuggingFaceResult | HuggingFaceResult[]): SentimentMapping {
  // Handle array of results (pick highest confidence)
  if (Array.isArray(result)) {
    if (result.length === 0) {
      return { label: "neutral", score: 0 }
    }

    const bestResult = result.reduce((prev, curr) => ((curr.score || 0) > (prev.score || 0) ? curr : prev))
    return mapSentimentLabel(bestResult)
  }

  // Handle single result
  if (!result || typeof result !== "object") {
    return { label: "neutral", score: 0 }
  }

  const { label, score = 0 } = result

  if (!label) {
    return { label: "neutral", score: 0 }
  }

  const normalizedLabel = label.toLowerCase()

  // This model returns direct string labels: "negative", "neutral", "positive"
  // Handle direct string labels first (most common case)
  if (normalizedLabel === "positive") {
    return { label: "positive", score }
  }
  if (normalizedLabel === "negative") {
    return { label: "negative", score }
  }
  if (normalizedLabel === "neutral") {
    return { label: "neutral", score }
  }

  // Handle LABEL_X format as fallback (if model returns this format)
  // For cardiffnlp/twitter-xlm-roberta-base-sentiment: 0=negative, 1=neutral, 2=positive
  if (normalizedLabel === "label_0") {
    return { label: "negative", score }
  }
  if (normalizedLabel === "label_1") {
    return { label: "neutral", score }
  }
  if (normalizedLabel === "label_2") {
    return { label: "positive", score }
  }

  // Handle partial matches as last resort
  if (normalizedLabel.includes("positive")) {
    return { label: "positive", score }
  }
  if (normalizedLabel.includes("negative")) {
    return { label: "negative", score }
  }

  console.warn(`Unknown sentiment label: ${label}, falling back to neutral`)
  return { label: "neutral", score }
}

export function normalizeSentimentScore(label: "positive" | "neutral" | "negative", confidence: number): number {
  // Normalize confidence score to sentiment score range [-1, 1]
  const normalizedConfidence = Math.min(Math.max(confidence, 0), 1) // Ensure 0-1 range

  switch (label) {
    case "positive":
      return normalizedConfidence // 0 to 1
    case "negative":
      return -normalizedConfidence // 0 to -1
    case "neutral":
    default:
      return 0 // Always 0 for neutral
  }
}
