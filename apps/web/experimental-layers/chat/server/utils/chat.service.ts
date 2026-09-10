import { createError, type H3Event } from 'h3'

import { requireAuthSession } from '../../../auth/server/utils/require-auth-session'
import { chatClientService } from './chat.client.service'
import { chatAssetService } from './chat.asset.service'
import { chatCompletionService } from './chat.completion.service'
import { createChatOperations } from './chat.operations'

export async function chatService(event: H3Event) {
  const principal = await requireAuthSession(event)

  return createChatOperations({
    principal,
    chatClient: await chatClientService(event),
    chatAssets: chatAssetService(),
    chatCompletion: chatCompletionService(),
    createHttpError: (statusCode, statusMessage) =>
      createError({
        statusCode,
        statusMessage
      })
  })
}
