import { createUIMessageStreamResponse } from 'ai'
import { getRouterParam } from 'h3'

import { validateRequestData } from '#server/validation'
import { validateBody } from '#server/utils/zod'
import { chatIdParamsSchema, streamChatSchema } from '../../utils/chat.schema'
import { chatService } from '../../utils/chat.service'

defineRouteMeta({
  openAPI: {
    description: 'Chat with AI.',
    tags: ['ai']
  }
})

export default defineEventHandler(async (event) => {
  const params = validateRequestData({
    schema: chatIdParamsSchema,
    data: {
      id: getRouterParam(event, 'id')
    },
    statusMessage: 'Invalid route params'
  })
  const body = await validateBody(streamChatSchema, event)
  const { streamChatResponse } = await chatService(event)
  const stream = await streamChatResponse({
    id: params.id,
    ...body
  })

  return createUIMessageStreamResponse({ stream })
})
