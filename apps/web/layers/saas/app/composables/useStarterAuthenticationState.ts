export function useStarterAuthenticationState() {
  const session = useStarterIdentitySession()
  const localePath = useLocalePath()

  const init = async () => {
    if (session.ready.value) return

    try {
      await session.fetch()
    } catch {
      // Zolta Starter may be opened before its Identity Console resource is configured.
      // Keep the public shell renderable and treat that state as signed out.
      session.error.value = null
    }
  }

  const login = async (redirect?: string | string[] | null, intent: 'login' | 'register' = 'login') => {
    const destination = resolveIdentityRedirect(redirect, localePath('/saas/dashboard'))
    await navigateTo(session.authorize(destination, intent), { external: true })
  }

  const logout = async () => {
    await session.clear(localePath('/saas'))
  }
  void init()

  return { session, login, logout }
}
