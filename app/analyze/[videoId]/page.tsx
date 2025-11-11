import { notFound } from "next/navigation"
import { AnalysisClient } from "@/components/analysis-client"

interface AnalyzePageProps {
  params: {
    videoId: string
  }
}

export default async function AnalyzePage({ params }: AnalyzePageProps) {
  const { videoId } = params

  // Validate video ID format
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <AnalysisClient videoId={videoId} />
      </div>
    </div>
  )
}
