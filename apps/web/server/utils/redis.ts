import { createClient } from 'redis'
import type { CacheService } from '#server/cache/interfaces/cache'

let client: ReturnType<typeof createClient> | null = null

async function getClient() {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL })

    client.on('error', (err: Error) => {
      console.error('Redis error:', err)
    })

    await client.connect()
  }

  return client
}

export const redisCache: CacheService = {
  async get<T>(key: string): Promise<T | null> {
    const c = await getClient()
    const value = await c.get(key)
    return value ? JSON.parse(value) : null
  },

  async set<T>(key: string, value: T, ttl: number) {
    const c = await getClient()
    await c.set(key, JSON.stringify(value), {
      EX: ttl
    })
  },

  async del(key: string) {
    const c = await getClient()
    await c.del(key)
  }
}
