import type { NotificationItem, NotificationPreference } from '../../shared/types/notifications'
import { useNotificationClient } from './client.notifications'
import { useNotificationState } from './state.notifications'
import { useNotificationSync } from './sync.notifications'

export function useNotificationActions() {
  const state = useNotificationState()
  const client = useNotificationClient()
  const { syncNotification, syncPreference } = useNotificationSync(state)

  async function markAsRead(notification: NotificationItem) {
    if (notification.status === 'read' || state.value.markingRead.includes(notification.id)) return notification
    state.value.markingRead = [...state.value.markingRead, notification.id]
    try {
      const updated = await client.markRead(notification.id)
      syncNotification(updated)
      return updated
    } finally {
      state.value.markingRead = state.value.markingRead.filter(id => id !== notification.id)
    }
  }

  async function updatePreference(preference: NotificationPreference) {
    const updated = await client.updatePreference(preference)
    syncPreference(updated)
    return updated
  }

  return { markAsRead, updatePreference }
}
