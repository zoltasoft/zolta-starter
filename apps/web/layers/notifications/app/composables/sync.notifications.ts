import type { NotificationItem, NotificationPreference } from '../../shared/types/notifications'
import type { NotificationState } from './state.notifications'

export function useNotificationSync(state: Ref<NotificationState>) {
  function syncNotification(updated: NotificationItem) {
    state.value.collection = {
      ...state.value.collection,
      notifications: state.value.collection.notifications.map(item => item.id === updated.id ? updated : item)
    }
  }

  function syncPreference(preference: NotificationPreference) {
    state.value.preference = preference
  }

  return { syncNotification, syncPreference }
}
