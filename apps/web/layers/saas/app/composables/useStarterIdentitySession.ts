/**
 * Browser-facing session adapter for Zoltasoft Starter's hosted Identity application.
 * Tokens remain encrypted in the server-side consumer session.
 */
export function useStarterIdentitySession() {
  const { csrf, headerName } = useCsrf()
  const identity = useZoltaIdentity('starter', {
    defaultRedirect: '/dashboard',
    logoutHeaders: () => ({ [headerName]: csrf })
  })

  return {
    ...identity,
    fetch: identity.refresh,
    clear: identity.logout
  }
}
