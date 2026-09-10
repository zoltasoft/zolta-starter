import { LRUCache } from 'lru-cache'
import type { CacheService } from '#server/cache/interfaces/cache'

const store = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5 // 5 minutes
})

// Redis crosses a serialization boundary. Keep the in-memory driver equally
// isolated so a caller cannot mutate a cached response used by another request.
function copy<T>(value: T): T {
  return structuredClone(value)
}

export const memoryCache: CacheService = {
  async get<T>(key: string): Promise<T | null> {
    const value = store.get(key) as T | undefined
    return value === undefined ? null : copy(value)
  },

  async set<T>(key: string, value: T, ttl: number) {
    store.set(key, copy(value), { ttl: ttl * 1000 })
  },

  async del(key: string) {
    store.delete(key)
  }
}
