import { type NextRequest, NextResponse } from "next/server"
import { getVideoMetadata } from "@/lib/youtube"
import { extractVideoId } from "@/lib/youtube-utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoIdParam = searchParams.get("videoId")

    if (!videoIdParam) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    // Extract video ID from URL if needed
    const videoId = extractVideoId(videoIdParam) || videoIdParam

    if (!videoId) {
      return NextResponse.json({ error: "Invalid video ID or URL" }, { status: 400 })
    }

    // Fetch video metadata
    const videoMetadata = await getVideoMetadata(videoId)

    if (!videoMetadata) {
      return NextResponse.json({ error: "Video not found or unavailable" }, { status: 404 })
    }

    return NextResponse.json(videoMetadata)
  } catch (error) {
    console.error("Video API error:", error)
    return NextResponse.json({ error: "Failed to fetch video metadata" }, { status: 500 })
  }
}
