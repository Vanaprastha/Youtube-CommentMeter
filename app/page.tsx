import { URLForm } from "@/components/url-form"
import { RecentAnalyses } from "@/components/recent-analyses"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, MessageCircle, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            YouTube<span className="text-blue-600">CommentMeter</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Analyze YouTube video comments sentiment in real-time. Discover what your audience really thinks.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge variant="secondary" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Comment Analysis
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Sentiment Charts
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Keyword Insights
            </Badge>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Analyze YouTube Video</CardTitle>
              <CardDescription>Enter a YouTube video URL to analyze the sentiment of its comments</CardDescription>
            </CardHeader>
            <CardContent>
              <URLForm />
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How it works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                    1
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Paste any YouTube video URL</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                    2
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">We fetch up to 100 top-level comments</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                    3
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    AI analyzes sentiment and generates insights
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Example Video</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Try analyzing this popular video:</p>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded block break-all">
                  https://www.youtube.com/watch?v=dQw4....
                </code>
              </CardContent>
            </Card>
          </div>

          <RecentAnalyses />
        </div>
      </div>
    </div>
  )
}
