import { useNotificationActions } from './actions.notifications'
import { useNotificationQuery } from './query.notifications'
import { useNotificationState } from './state.notifications'

export function useNotificationStore() {
  const state = useNotificationState()
  const unreadCount = computed(() => state.value.collection.notifications.filter(item => item.status === 'unread').length)
  return { state: readonly(state), unreadCount, ...useNotificationQuery(), ...useNotificationActions() }
}
