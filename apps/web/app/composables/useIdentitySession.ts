/**
 * Browser-facing session state for the Zoltasoft Starter Identity consumer.
 *
 * Identity owns the encrypted session cookie and all token material. This
 * adapter exposes only the user-facing state needed by the application shell.
 */
export function useIdentitySession() {
  const { csrf, headerName } = useCsrf()
  const localePath = useLocalePath()
  const identity = useZoltaIdentity('starter', {
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
