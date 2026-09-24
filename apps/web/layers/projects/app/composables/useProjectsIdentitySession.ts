export function useProjectsIdentitySession() {
  const { csrf, headerName } = useCsrf()
  const localePath = useLocalePath()
  const identity = useZoltaIdentity('projects', {
    defaultRedirect: '/projects/dashboard',
    logoutRedirect: localePath('/'),
    logoutHeaders: () => ({ [headerName]: csrf })
  })
  return { ...identity, fetch: identity.refresh, clear: identity.logout }
}
