import { createError, defineEventHandler, getQuery, getRouterParam, sendRedirect } from 'h3'

const actionIntents = {
  'login': 'login',
  'signup': 'register',
  'forgot-password': 'forgot-password',
  'reset-password': 'reset-password'
} as const

export default defineEventHandler((event) => {
  const action = getRouterParam(event, 'action') ?? ''
  const intent = actionIntents[action as keyof typeof actionIntents]
  if (!intent) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found.' })
  }

  const query = getQuery(event)
  const redirect = typeof query.redirect === 'string'
    && query.redirect.startsWith('/')
    && !query.redirect.startsWith('//')
    ? query.redirect
    : '/dashboard'
  const params = new URLSearchParams({ intent, returnTo: redirect })
  if (typeof query.email === 'string') params.set('email', query.email)
  if (typeof query.token === 'string') params.set('token', query.token)

  return sendRedirect(event, `/api/identity/starter/auth/authorize?${params}`, 302)
})
