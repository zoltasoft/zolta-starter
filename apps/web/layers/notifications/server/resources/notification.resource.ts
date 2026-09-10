import type {
  NotificationCollection,
  NotificationItem,
  NotificationKind,
  NotificationLevel,
  NotificationPreference
} from '../../shared/types/notifications'
import type {
  NotificationCollectionDto,
  NotificationDto,
  NotificationPreferenceDto
} from './notification.dto'

const levels = new Set<NotificationLevel>(['info', 'success', 'warning', 'error'])
const kinds = new Set<NotificationKind>([
  'application',
  'content',
  'message',
  'activity',
  'security',
  'system',
  'custom'
])

function notificationLevel(metadata?: Record<string, unknown> | null): NotificationLevel {
  const level = metadata?.level
  return typeof level === 'string' && levels.has(level as NotificationLevel)
    ? level as NotificationLevel
    : 'info'
}

function notificationKind(type: string): NotificationKind {
  return kinds.has(type as NotificationKind) ? type as NotificationKind : 'custom'
}

function translationParams(metadata?: Record<string, unknown> | null) {
  const params = metadata?.message_params
  if (!params || typeof params !== 'object' || Array.isArray(params)) return undefined

  return Object.fromEntries(Object.entries(params).filter((entry): entry is [string, string | number] =>
    typeof entry[1] === 'string' || typeof entry[1] === 'number'
  ))
}

export function toNotificationResource(notification: NotificationDto): NotificationItem {
  const actionTo = notification.metadata?.action_to
  const titleKey = notification.metadata?.title_key
  const messageKey = notification.metadata?.message_key

  return {
    id: notification.id,
    type: notificationKind(notification.type),
    status: notification.status === 'read' ? 'read' : 'unread',
    title: notification.title,
    message: notification.body,
    titleKey: typeof titleKey === 'string' ? titleKey : undefined,
    messageKey: typeof messageKey === 'string' ? messageKey : undefined,
    messageParams: translationParams(notification.metadata),
    level: notificationLevel(notification.metadata),
    actionTo: typeof actionTo === 'string' ? actionTo : undefined,
    readAt: notification.read_at ?? undefined,
    createdAt: notification.created_at,
    updatedAt: notification.updated_at
  }
}

export function toNotificationCollectionResource(
  collection: NotificationCollectionDto
): NotificationCollection {
  return {
    notifications: collection.notifications.map(toNotificationResource),
    meta: collection.meta
  }
}

export function toNotificationPreferenceResource(
  preference: NotificationPreferenceDto
): NotificationPreference {
  return {
    emailEnabled: preference.email_enabled,
    browserEnabled: preference.browser_enabled,
    inAppEnabled: preference.in_app_enabled,
    activityAlertsEnabled: preference.activity_alerts_enabled,
    remindersEnabled: preference.reminders_enabled,
    productUpdatesEnabled: preference.product_updates_enabled
  }
}
