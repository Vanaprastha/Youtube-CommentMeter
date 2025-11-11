"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts"

interface SentimentChartProps {
  sentiment: {
    totals: {
      total: number
      positive: number
      neutral: number
      negative: number
      percentPositive: number
      percentNeutral: number
      percentNegative: number
    }
  }
}

const COLORS = {
  positive: "#10b981",
  neutral: "#f59e0b",
  negative: "#ef4444",
}

export function SentimentChart({ sentiment }: SentimentChartProps) {
  const { totals } = sentiment

  const pieData = [
    { name: "Positive", value: totals.positive, color: COLORS.positive },
    { name: "Neutral", value: totals.neutral, color: COLORS.neutral },
    { name: "Negative", value: totals.negative, color: COLORS.negative },
  ]

  const barData = [
    { sentiment: "Positive", count: totals.positive, percentage: totals.percentPositive },
    { sentiment: "Neutral", count: totals.neutral, percentage: totals.percentNeutral },
    { sentiment: "Negative", count: totals.negative, percentage: totals.percentNegative },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Distribution</CardTitle>
          <CardDescription>Overall sentiment breakdown of {totals.total} comments</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              positive: { label: "Positive", color: COLORS.positive },
              neutral: { label: "Neutral", color: COLORS.neutral },
              negative: { label: "Negative", color: COLORS.negative },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comment Counts</CardTitle>
          <CardDescription>Number of comments by sentiment category</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: { label: "Comments", color: "#3b82f6" },
            }}
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="sentiment" />
                <YAxis />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [`${value} comments`, name]}
                />
                <Bar
                  dataKey="count"
                  fill={(entry) => {
                    const sentiment = entry.payload?.sentiment?.toLowerCase()
                    return COLORS[sentiment as keyof typeof COLORS] || "#3b82f6"
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
