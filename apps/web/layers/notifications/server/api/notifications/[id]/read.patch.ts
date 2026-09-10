import { getRouterParam } from 'h3'
import { z } from 'zod/v4'
import { handleZoltaApiError } from '#server/http'
import { validateRequestData } from '#server/validation'
import { notificationService } from '../../../utils/notification.service'

const notificationIdSchema = z.object({
  id: z.string().uuid('Invalid notification id')
})

export default defineEventHandler(async (event) => {
  await requireAuthSession(event)
  const { id } = validateRequestData({
    schema: notificationIdSchema,
    data: { id: getRouterParam(event, 'id') },
    statusMessage: 'Invalid notification'
  })
  try {
    return await (await notificationService(event)).markRead(id)
  } catch (error) {
    return handleZoltaApiError(error)
  }
})
