import { fileURLToPath } from 'node:url'

export type {
  NotificationCollection,
  NotificationItem,
  NotificationKind,
  NotificationLevel,
  NotificationPreference,
  NotificationStatus
} from './shared/types/notifications'

export const notificationsDir = fileURLToPath(new URL('./', import.meta.url))

export const notificationsAliases = {
  '#notifications': notificationsDir
} as const
