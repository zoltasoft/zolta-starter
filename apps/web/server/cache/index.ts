import type { CacheService } from '#server/cache/interfaces/cache'

function createCache(): CacheService {
  const driver = process.env.CACHE_DRIVER

  switch (driver) {
    case 'redis':
      return redisCache
    case 'memory':
    default:
      return memoryCache
  }
}

export const cache = createCache()
