import { mapSentimentLabel, normalizeSentimentScore } from "../lib/sentiment-utils"

describe("Sentiment mapping utilities", () => {
  describe("mapSentimentLabel", () => {
    it("should handle standard labels", () => {
      expect(mapSentimentLabel({ label: "POSITIVE", score: 0.9 })).toEqual({ label: "positive", score: 0.9 })

      expect(mapSentimentLabel({ label: "negative", score: 0.8 })).toEqual({ label: "negative", score: 0.8 })

      expect(mapSentimentLabel({ label: "Neutral", score: 0.7 })).toEqual({ label: "neutral", score: 0.7 })
    })

    it("should handle LABEL_X format", () => {
      expect(mapSentimentLabel({ label: "LABEL_0", score: 0.9 })).toEqual({ label: "negative", score: 0.9 })

      expect(mapSentimentLabel({ label: "LABEL_1", score: 0.8 })).toEqual({ label: "neutral", score: 0.8 })

      expect(mapSentimentLabel({ label: "LABEL_2", score: 0.7 })).toEqual({ label: "positive", score: 0.7 })
    })

    it("should handle array inputs", () => {
      const results = [
        { label: "positive", score: 0.3 },
        { label: "negative", score: 0.7 },
        { label: "neutral", score: 0.1 },
      ]

      expect(mapSentimentLabel(results)).toEqual({ label: "negative", score: 0.7 })
    })

    it("should fallback to neutral for invalid inputs", () => {
      expect(mapSentimentLabel({})).toEqual({ label: "neutral", score: 0 })
      expect(mapSentimentLabel([])).toEqual({ label: "neutral", score: 0 })
      expect(mapSentimentLabel(null as any)).toEqual({ label: "neutral", score: 0 })
    })
  })

  describe("normalizeSentimentScore", () => {
    it("should normalize scores correctly", () => {
      expect(normalizeSentimentScore("positive", 0.8)).toBe(0.8)
      expect(normalizeSentimentScore("negative", 0.8)).toBe(-0.8)
      expect(normalizeSentimentScore("neutral", 0.8)).toBe(0)
    })

    it("should handle negative confidence values", () => {
      expect(normalizeSentimentScore("positive", -0.8)).toBe(0.8)
      expect(normalizeSentimentScore("negative", -0.8)).toBe(-0.8)
    })
  })
})
