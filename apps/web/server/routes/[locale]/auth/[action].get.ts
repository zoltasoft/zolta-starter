import { createError, defineEventHandler, getQuery, getRouterParams, sendRedirect } from 'h3'

const actionIntents = {
  'login': 'login',
  'signup': 'register',
  'forgot-password': 'forgot-password',
  'reset-password': 'reset-password'
} as const

export default defineEventHandler((event) => {
  const { locale, action } = getRouterParams(event)
  const intent = action ? actionIntents[action as keyof typeof actionIntents] : null
  if (!['en', 'fr'].includes(locale ?? '') || !intent) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found.' })
  }

  const query = getQuery(event)
  const fallback = `/${locale}/dashboard`
  const redirect = typeof query.redirect === 'string'
    && query.redirect.startsWith('/')
    && !query.redirect.startsWith('//')
    ? query.redirect
    : fallback
  const params = new URLSearchParams({ intent, returnTo: redirect })
  if (typeof query.email === 'string') params.set('email', query.email)
  if (typeof query.token === 'string') params.set('token', query.token)

  return sendRedirect(event, `/api/identity/starter/auth/authorize?${params}`, 302)
})
