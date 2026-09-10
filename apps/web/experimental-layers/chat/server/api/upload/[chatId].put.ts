import { getRouterParam } from 'h3'

import { validateRequestData } from '#server/validation'
import { FILE_UPLOAD_CONFIG } from '#chat/shared/utils'
import { chatBlob } from '../../utils/chat.blob'
import { uploadChatParamsSchema } from '../../utils/chat.schema'
import { chatService } from '../../utils/chat.service'

export default defineEventHandler(async (event) => {
  const params = validateRequestData({
    schema: uploadChatParamsSchema,
    data: {
      chatId: getRouterParam(event, 'chatId')
    },
    statusMessage: 'Invalid route params'
  })

  const { authorizeChatUpload } = await chatService(event)
  const authorization = await authorizeChatUpload(params.chatId)

  return chatBlob.handleUpload(event, {
    formKey: 'files',
    multiple: false,
    ensure: {
      maxSize: FILE_UPLOAD_CONFIG.maxSize,
      types: [...FILE_UPLOAD_CONFIG.types]
    },
    put: {
      addRandomSuffix: true,
      prefix: authorization.prefix
    }
  })
})
