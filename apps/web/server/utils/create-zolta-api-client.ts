import { createIdentityApiClient } from '@zoltasoft/identity-consumer-nuxt/runtime'
import type { ZoltaApiFetchClient } from '@zoltasoft/api-client'
import type { H3Event } from 'h3'

/** Creates an authenticated product API client for an optional future layer. */
export function createZoltaApiClient(event: H3Event, application: 'starter' | 'projects' = 'starter'): Promise<ZoltaApiFetchClient> {
  return createIdentityApiClient(event, application, {
    baseURL: process.env.ZOLTA_STARTER_API_URL ?? process.env.ZOLTA_API_URL ?? 'http://localhost:8000',
    internalToken: process.env.ZOLTA_INTERNAL_SERVICE_TOKEN ?? ''
  })
}
