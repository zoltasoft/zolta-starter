import { validateBody } from '#server/utils/zod'
import { toChatResource } from '../../utils/chat.mapper'
import { createChatSchema } from '../../utils/chat.schema'
import { chatService } from '../../utils/chat.service'

export default defineEventHandler(async (event) => {
  const body = await validateBody(createChatSchema, event)
  const { createChat } = await chatService(event)

  return toChatResource(await createChat(body))
})
