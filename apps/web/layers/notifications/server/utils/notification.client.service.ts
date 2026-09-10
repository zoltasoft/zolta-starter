import type { H3Event } from 'h3'
import type { ZoltaApiEnvelope } from '@zoltasoft/api-client'
import { createEventZoltaApiClient } from '#server/utils/create-event-zolta-api-client'
import type { NotificationCollectionDto, NotificationDto, NotificationPreferenceDto } from '../resources'

export async function notificationClientService(event: H3Event) {
  const client = await createEventZoltaApiClient(event)

  return {
    list: (query: { page: number, perPage: number, status?: 'read' | 'unread' }) =>
      client<ZoltaApiEnvelope<NotificationCollectionDto>>('/api/notifications', {
        query: {
          page: query.page,
          per_page: query.perPage,
          sort: ['-created_at'],
          ...(query.status ? { 'filter[status]': query.status } : {})
        }
      }),
    markRead: (id: string) => client<ZoltaApiEnvelope<{ notification: NotificationDto }>>(
      `/api/notifications/${id}/read`, { method: 'PATCH' }
    ),
    preference: () => client<ZoltaApiEnvelope<{ notification_preference: NotificationPreferenceDto }>>(
      '/api/notification-preferences'
    ),
    updatePreference: (body: NotificationPreferenceDto) =>
      client<ZoltaApiEnvelope<{ notification_preference: NotificationPreferenceDto }>>(
        '/api/notification-preferences', { method: 'PUT', body }
      )
  }
}
