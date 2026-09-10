const localeCodes = new Set(['en', 'fr'])
const defaultLocale = 'en'

export default defineNuxtRouteMiddleware((to) => {
  const firstSegment = to.path.split('/')[1]
  if (
    to.path === '/'
    || to.path.startsWith('/api/')
    || to.path.startsWith('/_')
    || localeCodes.has(firstSegment ?? '')
    || /\/[^/]+\.[^/]+$/.test(to.path)
  ) return

  return navigateTo({
    path: `/${defaultLocale}${to.path}`,
    query: to.query,
    hash: to.hash
  }, { redirectCode: 302 })
})
