export function extractVideoId(url: string): string | null {
  if (!url || typeof url !== "string") {
    return null
  }

  const patterns = [
    // Standard YouTube URLs
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    // Short YouTube URLs
    /(?:youtu\.be\/)([^&\n?#]+)/,
    // Embed URLs
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    // Mobile URLs
    /(?:m\.youtube\.com\/watch\?v=)([^&\n?#]+)/,
    // YouTube URLs with additional parameters
    /(?:youtube\.com\/watch\?.*&v=)([^&\n?#]+)/,
    // Direct video ID (11 characters)
    /^([a-zA-Z0-9_-]{11})$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1] && isValidVideoId(match[1])) {
      return match[1]
    }
  }

  return null
}

export function isValidVideoId(videoId: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId)
}

// Test cases for unit testing
export const TEST_CASES = [
  {
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    expected: "dQw4w9WgXcQ",
  },
  {
    url: "https://youtu.be/dQw4w9WgXcQ",
    expected: "dQw4w9WgXcQ",
  },
  {
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    expected: "dQw4w9WgXcQ",
  },
  {
    url: "https://m.youtube.com/watch?v=dQw4w9WgXcQ",
    expected: "dQw4w9WgXcQ",
  },
  {
    url: "https://www.youtube.com/watch?feature=player_embedded&v=dQw4w9WgXcQ",
    expected: "dQw4w9WgXcQ",
  },
  {
    url: "dQw4w9WgXcQ",
    expected: "dQw4w9WgXcQ",
  },
  {
    url: "invalid-url",
    expected: null,
  },
  {
    url: "",
    expected: null,
  },
]
