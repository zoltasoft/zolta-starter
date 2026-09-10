import { z } from 'zod'
import { handleZoltaApiError } from '#server/http'
import { notificationService } from '../../utils/notification.service'

const notificationPreferenceSchema = z.object({
  emailEnabled: z.boolean(),
  browserEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
  activityAlertsEnabled: z.boolean(),
  remindersEnabled: z.boolean(),
  productUpdatesEnabled: z.boolean()
})

export default defineEventHandler(async (event) => {
  await requireAuthSession(event)
  const preference = await validateBody(notificationPreferenceSchema, event)
  try {
    return await (await notificationService(event)).updatePreference(preference)
  } catch (error) {
    return handleZoltaApiError(error)
  }
})
