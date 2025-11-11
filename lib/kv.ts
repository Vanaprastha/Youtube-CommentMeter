import { Redis } from "@upstash/redis"
import { mockKV } from "./kv-mock"

// Check if we're in development and KV vars are missing
const isDevelopment = process.env.NODE_ENV === "development"
const hasKVVars = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN

let kv: Redis | typeof mockKV

if (isDevelopment && !hasKVVars) {
  console.log("🔧 [DEV MODE] Using Mock KV (Redis environment variables not found)")
  kv = mockKV
} else {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    throw new Error("Missing Upstash KV environment variables")
  }

  kv = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  })
}

export { kv }
