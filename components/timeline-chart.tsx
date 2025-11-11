"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"

interface TimelineChartProps {
  comments: Array<{
    id: string
    publishedAt: string
  }>
  sentiment: {
    items: Array<{
      id: string
      score: number
    }>
  }
}

export function TimelineChart({ comments, sentiment }: TimelineChartProps) {
  // Group comments by day and calculate average sentiment
  const timelineData = comments.reduce(
    (acc, comment) => {
      const date = new Date(comment.publishedAt).toISOString().split("T")[0]
      const sentimentData = sentiment.items.find((r) => r.id === comment.id)

      if (!acc[date]) {
        acc[date] = { date, scores: [], count: 0 }
      }

      if (sentimentData) {
        acc[date].scores.push(sentimentData.score)
        acc[date].count++
      }

      return acc
    },
    {} as Record<string, { date: string; scores: number[]; count: number }>,
  )

  const chartData = Object.values(timelineData)
    .map(({ date, scores, count }) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      avgSentiment: scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0,
      commentCount: count,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14) // Show last 14 days

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Timeline</CardTitle>
        <CardDescription>Average sentiment score over time (last 14 days)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            avgSentiment: { label: "Average Sentiment", color: "#3b82f6" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis domain={[-1, 1]} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value, name) => [`${Number(value).toFixed(2)}`, "Avg Sentiment"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="avgSentiment"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
