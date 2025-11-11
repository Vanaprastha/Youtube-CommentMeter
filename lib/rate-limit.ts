import { kv } from "./kv"

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

const RATE_LIMIT_WINDOW = 60 // 60 seconds
const RATE_LIMIT_MAX = 5 // 5 requests per window

export async function checkRateLimit(route: string, identifier: string): Promise<RateLimitResult> {
  const key = `rl:${route}:${identifier}`
  const now = Math.floor(Date.now() / 1000)

  try {
    // Get current count
    const current = await kv.get(key)
    const count = typeof current === "number" ? current : 0

    if (count >= RATE_LIMIT_MAX) {
      return {
        success: false,
        remaining: 0,
        resetTime: now + RATE_LIMIT_WINDOW,
      }
    }

    // Increment counter
    await kv.setex(key, RATE_LIMIT_WINDOW, count + 1)

    return {
      success: true,
      remaining: RATE_LIMIT_MAX - count - 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    }
  } catch (error) {
    console.error("Rate limit check error:", error)
    // Allow request on error (especially in development)
    return {
      success: true,
      remaining: RATE_LIMIT_MAX - 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    }
  }
}
