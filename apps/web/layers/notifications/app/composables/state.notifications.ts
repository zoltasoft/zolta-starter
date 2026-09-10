import type { NotificationCollection, NotificationPreference } from '../../shared/types/notifications'

const defaultCollection = (): NotificationCollection => ({
  notifications: [],
  meta: { total: 0, perPage: 10, currentPage: 1, lastPage: 1 }
})

const defaultPreference = (): NotificationPreference => ({
  emailEnabled: true,
  browserEnabled: false,
  inAppEnabled: true,
  activityAlertsEnabled: true,
  remindersEnabled: true,
  productUpdatesEnabled: false
})

export type NotificationState = {
  collection: NotificationCollection
  preference: NotificationPreference
  pending: boolean
  preferencePending: boolean
  error: { message: string } | null
  preferenceError: { message: string } | null
  markingRead: string[]
}

export const useNotificationState = () => useState<NotificationState>('notifications:state', () => ({
  collection: defaultCollection(),
  preference: defaultPreference(),
  pending: false,
  preferencePending: false,
  error: null,
  preferenceError: null,
  markingRead: []
}))
