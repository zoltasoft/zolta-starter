import { useNotificationStore } from './store.notifications'

export function useNotifications() {
  const store = useNotificationStore()
  const request = useAsyncData('notifications-current-user', () => store.load({ per_page: 10 }))
  return {
    notifications: computed(() => store.state.value.collection.notifications),
    unreadCount: store.unreadCount,
    status: request.status,
    error: request.error,
    refresh: request.refresh,
    markingRead: computed(() => store.state.value.markingRead),
    markAsRead: store.markAsRead
  }
}
