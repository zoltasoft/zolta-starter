import { createIdentityApiClient } from '@zoltasoft/identity-consumer-nuxt/runtime'
import type { ZoltaApiFetchClient } from '@zoltasoft/api-client'
import type { H3Event } from 'h3'

/** Creates an authenticated product API client for an optional future layer. */
export function createEventZoltaApiClient(event: H3Event): Promise<ZoltaApiFetchClient> {
  return createIdentityApiClient(event, 'starter', {
    baseURL: process.env.ZOLTA_STARTER_API_URL ?? 'http://localhost:8000',
    internalToken: process.env.ZOLTA_STARTER_INTERNAL_SERVICE_TOKEN ?? ''
  })
}
