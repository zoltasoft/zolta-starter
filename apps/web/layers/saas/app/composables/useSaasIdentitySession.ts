/**
 * Browser-facing session adapter for the SaaS hosted Identity application.
 * Tokens remain encrypted in the server-side consumer session.
 */
export function useSaasIdentitySession() {
  const { csrf, headerName } = useCsrf()
  const localePath = useLocalePath()
  const identity = useZoltaIdentity('saas', {
    defaultRedirect: '/dashboard',
    logoutRedirect: localePath('/'),
    logoutHeaders: () => ({ [headerName]: csrf })
  })

  return {
    ...identity,
    fetch: identity.refresh,
    clear: identity.logout
  }
}
