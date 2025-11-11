export interface VideoMetadata {
  id: string
  title: string
  description: string
  channelTitle: string
  channelId: string
  publishedAt: string
  thumbnail: string
  duration: string
  viewCount: number
  likeCount: number
  commentCount: number
}

export interface Comment {
  id: string
  textOriginal: string
  authorDisplayName: string
  authorProfileImageUrl: string
  likeCount: number
  publishedAt: string
  updatedAt: string
}

export interface SentimentAnalysis {
  commentId: string
  label: "positive" | "neutral" | "negative"
  score: number
  confidence: number
}

export interface SentimentResult {
  results: SentimentAnalysis[]
  summary: {
    total: number
    positive: number
    neutral: number
    negative: number
    positivePercent: number
    neutralPercent: number
    negativePercent: number
    averageScore: number
  }
}

export interface Keyword {
  word: string
  frequency: number
}
