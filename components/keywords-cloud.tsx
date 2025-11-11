"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { extractKeywords } from "@/lib/text-utils"
import type { Comment } from "@/lib/types"

interface KeywordsCloudProps {
  comments: Comment[]
}

export function KeywordsCloud({ comments }: KeywordsCloudProps) {
  const allText = comments.map((c) => c.textOriginal).join(" ")
  const keywords = extractKeywords(allText)

  const getSizeClass = (frequency: number, maxFreq: number) => {
    const ratio = frequency / maxFreq
    if (ratio > 0.8) return "text-2xl"
    if (ratio > 0.6) return "text-xl"
    if (ratio > 0.4) return "text-lg"
    if (ratio > 0.2) return "text-base"
    return "text-sm"
  }

  const getColorClass = (frequency: number, maxFreq: number) => {
    const ratio = frequency / maxFreq
    if (ratio > 0.8) return "bg-blue-600 text-white"
    if (ratio > 0.6) return "bg-blue-500 text-white"
    if (ratio > 0.4) return "bg-blue-400 text-white"
    if (ratio > 0.2) return "bg-blue-300 text-blue-900"
    return "bg-blue-100 text-blue-800"
  }

  const maxFreq = Math.max(...keywords.map((k) => k.frequency))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Keywords</CardTitle>
        <CardDescription>Most frequently mentioned words and phrases in comments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {keywords.slice(0, 50).map((keyword, index) => (
            <Badge
              key={index}
              variant="secondary"
              className={`${getSizeClass(keyword.frequency, maxFreq)} ${getColorClass(keyword.frequency, maxFreq)} transition-all hover:scale-105`}
            >
              {keyword.word} ({keyword.frequency})
            </Badge>
          ))}
        </div>
        {keywords.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No keywords extracted from comments</p>
        )}
      </CardContent>
    </Card>
  )
}
