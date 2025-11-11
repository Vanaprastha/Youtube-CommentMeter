"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SentimentChartProps {
  sentiment: {
    summary: {
      total: number
      positive: number
      neutral: number
      negative: number
      positivePercent: number
      neutralPercent: number
      negativePercent: number
    }
  }
}

export function SentimentChart({ sentiment }: SentimentChartProps) {
  const { summary } = sentiment

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Distribution</CardTitle>
        <CardDescription>Overall sentiment breakdown of {summary.total} comments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Simple Bar Chart dengan CSS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">Positive</span>
              <span className="text-sm text-gray-500">
                {summary.positive} ({summary.positivePercent.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${summary.positivePercent}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-600">Neutral</span>
              <span className="text-sm text-gray-500">
                {summary.neutral} ({summary.neutralPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${summary.neutralPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-600">Negative</span>
              <span className="text-sm text-gray-500">
                {summary.negative} ({summary.negativePercent.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-red-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${summary.negativePercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
