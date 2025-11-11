import { kv } from "./kv"

export async function kvGetJSON<T>(key: string): Promise<T | null> {
  try {
    const result = await kv.get(key)
    return result as T | null
  } catch (error) {
    console.error(`Error getting key ${key} from KV:`, error)
    return null
  }
}

export async function kvSetJSON<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  try {
    await kv.setex(key, ttlSeconds, data)
  } catch (error) {
    console.error(`Error setting key ${key} in KV:`, error)
    // Don't throw error in development mode
    if (process.env.NODE_ENV !== "development") {
      throw error
    }
  }
}
