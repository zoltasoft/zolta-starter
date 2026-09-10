import type { NotificationCollection, NotificationItem, NotificationPreference } from '../../shared/types/notifications'

/** Browser-only BFF transport for notification workflows. */
export function useNotificationClient() {
  const authenticatedFetch = useAuthenticatedFetch()
  const { csrf, headerName } = useCsrf()

  return {
    list: (query: { page?: number, per_page?: number, status?: 'read' | 'unread' } = {}) =>
      authenticatedFetch<NotificationCollection>('/api/notifications', { query }),
    markRead: (id: string) => authenticatedFetch<NotificationItem>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { [headerName]: csrf }
    }),
    preference: () => authenticatedFetch<NotificationPreference>('/api/notification-preferences'),
    updatePreference: (preference: NotificationPreference) => authenticatedFetch<NotificationPreference>('/api/notification-preferences', {
      method: 'PUT',
      headers: { [headerName]: csrf },
      body: preference
    })
  }
}
