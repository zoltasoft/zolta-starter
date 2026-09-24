export default defineNuxtRouteMiddleware(async (to) => {
  const session = useProjectsIdentitySession()
  await session.fetch()
  if (!session.loggedIn.value) return navigateTo(session.authorize(to.fullPath), { external: true })
})
