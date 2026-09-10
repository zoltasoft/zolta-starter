import { getQuery } from 'h3'

import { validateRequestData } from '#server/validation'
import { toChatsResource } from '../../utils/chat.mapper'
import { listChatsQuerySchema } from '../../utils/chat.schema'
import { chatService } from '../../utils/chat.service'

export default defineEventHandler(async (event) => {
  validateRequestData({
    schema: listChatsQuerySchema,
    data: getQuery(event),
    statusMessage: 'Invalid request',
    strict: true
  })

  const { listChats } = await chatService(event)
  const chats = await listChats()

  return toChatsResource(chats)
})
