export function useStarterAuthenticatedFetch() {
  const { csrf, headerName } = useCsrf()
  const localePath = useLocalePath()

  return useZoltaIdentityFetch('starter', {
    defaultRedirect: localePath('/dashboard'),
    logoutHeaders: () => ({ [headerName]: csrf })
  })
}
