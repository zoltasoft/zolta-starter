import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const session = useIdentitySession()
  const localePath = useLocalePath()
  let expiryTimer: ReturnType<typeof setTimeout> | undefined

  const clearExpiryTimer = () => {
    if (expiryTimer) clearTimeout(expiryTimer)
    expiryTimer = undefined
  }

  watch(
    () => (session.user.value as { expiresAt?: string | null } | null)?.expiresAt,
    (expiresAt) => {
      clearExpiryTimer()
      if (!expiresAt) return

      const delay = Date.parse(expiresAt) - Date.now()
      if (!Number.isFinite(delay)) return

      const expire = async () => {
        await session.clear(`${localePath('/auth/login')}?expired=1`)
      }

      if (delay <= 0) {
        void expire()
        return
      }

      expiryTimer = setTimeout(expire, Math.min(Math.max(0, delay - 2_000), 2_147_483_647))
    },
    { immediate: true }
  )

  // Intercept all fetch errors
  nuxtApp.hook('app:error', (err) => {
    if (!err) return
    // Check for ZoltaApiError or a generic 401 response.
    const statusCode = err.statusCode || err.status || (err.response && err.response.status)
    if (statusCode === 401) {
      // Clear session and redirect to login
      void session.clear(localePath('/auth/login'))
    }
  })
})
