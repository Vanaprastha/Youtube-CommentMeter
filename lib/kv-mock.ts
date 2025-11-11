// Mock KV untuk development lokal
class MockKV {
  private storage = new Map<string, { data: any; expiry: number }>()

  async get(key: string): Promise<any> {
    const item = this.storage.get(key)
    if (!item) return null

    // Check if expired
    if (Date.now() > item.expiry) {
      this.storage.delete(key)
      return null
    }

    console.log(`[MOCK KV] GET ${key}:`, item.data)
    return item.data
  }

  async setex(key: string, seconds: number, data: any): Promise<void> {
    const expiry = Date.now() + seconds * 1000
    this.storage.set(key, { data, expiry })
    console.log(`[MOCK KV] SET ${key} (TTL: ${seconds}s):`, data)
  }

  async set(key: string, data: any): Promise<void> {
    const expiry = Date.now() + 3600 * 1000 // Default 1 hour
    this.storage.set(key, { data, expiry })
    console.log(`[MOCK KV] SET ${key}:`, data)
  }

  // Cleanup expired items
  cleanup() {
    const now = Date.now()
    for (const [key, item] of this.storage.entries()) {
      if (now > item.expiry) {
        this.storage.delete(key)
      }
    }
  }
}

export const mockKV = new MockKV()

// Cleanup every 5 minutes
if (typeof window === "undefined") {
  setInterval(
    () => {
      mockKV.cleanup()
    },
    5 * 60 * 1000,
  )
}
