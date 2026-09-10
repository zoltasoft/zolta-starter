import type { H3Event } from 'h3'
import type { NotificationPreference } from '../../shared/types/notifications'
import {
  toNotificationCollectionResource,
  toNotificationPreferenceResource,
  toNotificationResource
} from '../resources'
import { notificationClientService } from './notification.client.service'

export async function notificationService(event: H3Event) {
  const client = await notificationClientService(event)

  return {
    async list(query: { page: number, perPage: number, status?: 'read' | 'unread' }) {
      return toNotificationCollectionResource((await client.list(query)).data)
    },
    async markRead(id: string) {
      return toNotificationResource((await client.markRead(id)).data.notification)
    },
    async preference() {
      return toNotificationPreferenceResource((await client.preference()).data.notification_preference)
    },
    async updatePreference(preference: NotificationPreference) {
      return toNotificationPreferenceResource((await client.updatePreference({
        email_enabled: preference.emailEnabled,
        browser_enabled: preference.browserEnabled,
        in_app_enabled: preference.inAppEnabled,
        activity_alerts_enabled: preference.activityAlertsEnabled,
        reminders_enabled: preference.remindersEnabled,
        product_updates_enabled: preference.productUpdatesEnabled
      })).data.notification_preference)
    }
  }
}
