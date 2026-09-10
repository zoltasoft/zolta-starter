import { isIdentitySessionExpired } from '~~/shared/utils/identity-session'

export default defineNuxtRouteMiddleware(async (to) => {
  const session = useStarterIdentitySession()

  await session.fetch()

  if (isIdentitySessionExpired(session.user.value)) {
    await session.clear(`/saas?redirect=${encodeURIComponent(to.fullPath)}&expired=1`)
    return
  }

  if (!session.loggedIn.value) {
    return navigateTo(session.authorize(to.fullPath), { external: true })
  }
})
