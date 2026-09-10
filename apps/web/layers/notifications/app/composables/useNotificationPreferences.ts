import { useNotificationStore } from './store.notifications'

export function useNotificationPreferences() {
  const store = useNotificationStore()
  const request = useAsyncData('notification-preferences-current-user', store.loadPreference)
  return {
    preference: computed(() => store.state.value.preference),
    status: request.status,
    error: request.error,
    refresh: request.refresh,
    update: store.updatePreference
  }
}
