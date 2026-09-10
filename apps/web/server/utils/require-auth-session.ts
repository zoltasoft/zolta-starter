import { createError, type H3Event } from 'h3'
import { logoutIdentityApplication, requireIdentityUser } from '@zoltasoft/identity-consumer-nuxt/runtime'
import type { IdentityAuthenticatedUser } from '~~/shared/types/identity-authenticated-user'
import { isIdentitySessionExpired } from '~~/shared/utils/identity-session'

export async function requireAuthSession(event: H3Event): Promise<IdentityAuthenticatedUser> {
  const user = await requireIdentityUser(event, 'starter') as IdentityAuthenticatedUser
  if (isIdentitySessionExpired(user)) {
    await logoutIdentityApplication(event, 'starter')
    throw createError({ statusCode: 401, statusMessage: 'Your Identity session has expired.' })
  }
  return user
}
