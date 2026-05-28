import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function rateLimit(key: string, limit = 10, windowMs = 60_000): Promise<boolean> {
  const windowKey = `${key}:${Math.floor(Date.now() / windowMs)}`
  const current = await redis.incr(windowKey)
  if (current === 1) await redis.expire(windowKey, Math.ceil(windowMs / 1000))
  return current <= limit
}
