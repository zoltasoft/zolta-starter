import { getRouterParam } from 'h3'

import { validateRequestData } from '#server/validation'
import { toChatConversationResource } from '../../utils/chat.mapper'
import { chatIdParamsSchema } from '../../utils/chat.schema'
import { chatService } from '../../utils/chat.service'

export default defineEventHandler(async (event) => {
  const params = validateRequestData({
    schema: chatIdParamsSchema,
    data: {
      id: getRouterParam(event, 'id')
    },
    statusMessage: 'Invalid route params'
  })

  const { getChatById } = await chatService(event)
  const chat = await getChatById(params.id)

  return toChatConversationResource(chat)
})
