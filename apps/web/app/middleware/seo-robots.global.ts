import { shouldNoIndexStarterPath } from '~~/shared/seo/starter'

export default defineNuxtRouteMiddleware((to) => {
  if (shouldNoIndexStarterPath(to.path)) {
    useSeoMeta({ robots: 'noindex, nofollow' })
  }
})
