export type NotificationLevel = 'info' | 'success' | 'warning' | 'error'

export type NotificationKind
  = | 'application'
    | 'content'
    | 'message'
    | 'activity'
    | 'security'
    | 'system'
    | 'custom'

export type NotificationStatus = 'unread' | 'read'

export type NotificationItem = {
  id: string
  type: NotificationKind
  status: NotificationStatus
  title: string
  message: string
  titleKey?: string
  messageKey?: string
  messageParams?: Record<string, string | number>
  level: NotificationLevel
  actionTo?: string
  readAt?: string
  createdAt: string
  updatedAt: string
}

export type NotificationCollection = {
  notifications: NotificationItem[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
}

export type NotificationPreference = {
  emailEnabled: boolean
  browserEnabled: boolean
  inAppEnabled: boolean
  activityAlertsEnabled: boolean
  remindersEnabled: boolean
  productUpdatesEnabled: boolean
}
