import { getQuery } from 'h3'
import { z } from 'zod/v4'
import { handleZoltaApiError } from '#server/http'
import { validateRequestData } from '#server/validation'
import { notificationService } from '../../utils/notification.service'

const listNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(50).default(10),
  status: z.enum(['unread', 'read']).optional()
})

export default defineEventHandler(async (event) => {
  await requireAuthSession(event)
  const query = validateRequestData({
    schema: listNotificationsSchema,
    data: getQuery(event),
    statusMessage: 'Invalid notifications query'
  })
  try {
    return await (await notificationService(event)).list({
      page: query.page,
      perPage: query.per_page,
      status: query.status
    })
  } catch (error) {
    return handleZoltaApiError(error)
  }
})
