import { isIdentitySessionExpired } from '~~/shared/utils/identity-session'

export default defineNuxtRouteMiddleware(async (to) => {
  const session = useIdentitySession()
  const localePath = useLocalePath()

  await session.fetch()

  if (isIdentitySessionExpired(session.user.value)) {
    await session.clear(`${localePath('/auth/login')}?redirect=${encodeURIComponent(to.fullPath)}&expired=1`)
    return
  }

  if (!session.loggedIn.value) {
    return navigateTo({
      path: localePath('/auth/login'),
      query: { redirect: to.fullPath }
    })
  }
})
