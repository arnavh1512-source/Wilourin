import { Redis } from '@upstash/redis'

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

/**
 * Redis is optional. When Upstash is not configured the limiter degrades to an
 * in-process counter instead of throwing at module scope, which previously took
 * down every route that imported it (H1).
 */
const redis = url && token ? new Redis({ url, token }) : null

export const isDistributedRateLimit = redis !== null

const memory = new Map<string, number>()

function memoryLimit(windowKey: string, limit: number, windowMs: number): boolean {
  // Opportunistic sweep so a single process cannot grow the map without bound.
  if (memory.size > 5_000) {
    const cutoff = Math.floor(Date.now() / windowMs)
    for (const k of memory.keys()) {
      if (Number(k.slice(k.lastIndexOf(':') + 1)) < cutoff) memory.delete(k)
    }
  }
  const next = (memory.get(windowKey) ?? 0) + 1
  memory.set(windowKey, next)
  return next <= limit
}

export async function rateLimit(key: string, limit = 10, windowMs = 60_000): Promise<boolean> {
  const windowKey = `${key}:${Math.floor(Date.now() / windowMs)}`

  if (!redis) return memoryLimit(windowKey, limit, windowMs)

  try {
    const current = await redis.incr(windowKey)
    if (current === 1) await redis.expire(windowKey, Math.ceil(windowMs / 1000))
    return current <= limit
  } catch (err) {
    // Never let a rate-limiter outage become a 500 on a payment route.
    console.error('[rateLimit] Redis unavailable, falling back to in-process counter:', err instanceof Error ? err.message : 'unknown error')
    return memoryLimit(windowKey, limit, windowMs)
  }
}
