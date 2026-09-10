import { handleZoltaApiError } from '#server/http'
import { notificationService } from '../../utils/notification.service'

export default defineEventHandler(async (event) => {
  await requireAuthSession(event)
  try {
    return await (await notificationService(event)).preference()
  } catch (error) {
    return handleZoltaApiError(error)
  }
})
