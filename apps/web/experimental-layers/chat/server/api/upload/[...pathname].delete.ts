import { getRouterParam, sendNoContent } from 'h3'

import { validateRequestData } from '#server/validation'
import { deleteChatAssetParamsSchema } from '../../utils/chat.schema'
import { chatService } from '../../utils/chat.service'

export default defineEventHandler(async (event) => {
  const params = validateRequestData({
    schema: deleteChatAssetParamsSchema,
    data: {
      pathname: getRouterParam(event, 'pathname')
    },
    statusMessage: 'Invalid route params'
  })

  const { deleteChatAsset } = await chatService(event)
  await deleteChatAsset(params.pathname)

  return sendNoContent(event)
})
