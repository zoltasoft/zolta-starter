export function useStarterAuthenticatedFetch() {
  const { csrf, headerName } = useCsrf()
  const localePath = useLocalePath()

  return useZoltaIdentityFetch('starter', {
    defaultRedirect: localePath('/saas/dashboard'),
    logoutHeaders: () => ({ [headerName]: csrf })
  })
}
