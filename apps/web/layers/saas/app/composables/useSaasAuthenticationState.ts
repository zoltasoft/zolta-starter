export function useSaasAuthenticationState() {
  const session = useSaasIdentitySession()
  const localePath = useLocalePath()

  const init = async () => {
    if (session.ready.value) return

    try {
      await session.fetch()
    } catch {
      // The public SaaS shell remains renderable while Identity is unavailable.
      session.error.value = null
    }
  }

  const login = async (redirect?: string | string[] | null, intent: 'login' | 'register' = 'login') => {
    const destination = resolveIdentityRedirect(redirect, localePath('/dashboard'))
    await navigateTo(session.authorize(destination, intent), { external: true })
  }

  const logout = async () => {
    await session.clear(localePath('/'))
  }

  void init()

  return { session, login, logout }
}
