import { createError, getRequestIP, type H3Event } from 'h3'
import { LRUCache } from 'lru-cache'

type RateLimitEntry = { count: number, resetAt: number }

const requests = new LRUCache<string, RateLimitEntry>({ max: 10_000 })

/** Lightweight process-local protection for public BFF routes. */
export function enforceRateLimit(
  event: H3Event,
  { namespace, limit, windowMs = 60_000 }: { namespace: string, limit: number, windowMs?: number }
): void {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const key = `${namespace}:${ip}`
  const now = Date.now()
  const current = requests.get(key)
  const entry = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + windowMs }
    : current

  entry.count += 1
  requests.set(key, entry, { ttl: Math.max(1, entry.resetAt - now) })
  if (entry.count <= limit) return

  setHeader(event, 'Retry-After', Math.max(1, Math.ceil((entry.resetAt - now) / 1000)))
  throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
}
