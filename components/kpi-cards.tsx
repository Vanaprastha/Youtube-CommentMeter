import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface SentimentSummary {
  total: number
  positive: number
  neutral: number
  negative: number
  percentPositive: number
  percentNeutral: number
  percentNegative: number
  avgScore: number
  weightedAvgScore: number
}

interface KPICardsProps {
  sentiment: {
    totals: SentimentSummary
  }
}

export function KPICards({ sentiment }: KPICardsProps) {
  const { totals } = sentiment

  const getScoreColor = (score: number) => {
    if (score > 0.1) return "text-green-600 dark:text-green-400"
    if (score < -0.1) return "text-red-600 dark:text-red-400"
    return "text-yellow-600 dark:text-yellow-400"
  }

  const getScoreIcon = (score: number) => {
    if (score > 0.1) return <TrendingUp className="w-4 h-4" />
    if (score < -0.1) return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Positive</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {totals.percentPositive.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">{totals.positive} comments</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Neutral</CardTitle>
          <Minus className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {totals.percentNeutral.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">{totals.neutral} comments</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Negative</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{totals.percentNegative.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">{totals.negative} comments</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          {getScoreIcon(totals.avgScore)}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getScoreColor(totals.avgScore)}`}>{totals.avgScore.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Range: -1 to +1</p>
        </CardContent>
      </Card>
    </div>
  )
}
