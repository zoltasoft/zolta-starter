export function useAuthenticatedFetch() {
  const { csrf, headerName } = useCsrf()
  const localePath = useLocalePath()

  return useZoltaIdentityFetch('starter', {
    defaultRedirect: localePath('/dashboard'),
    loginPath: localePath('/auth/login'),
    logoutHeaders: () => ({ [headerName]: csrf })
  })
}
