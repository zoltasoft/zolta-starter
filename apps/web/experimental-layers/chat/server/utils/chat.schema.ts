import type { UIMessage } from 'ai'
import { z } from 'zod'

export const listChatsQuerySchema = z.object({}).strict()

export const createChatSchema = z.object({
  id: z.string().trim().min(1),
  message: z.custom<UIMessage>()
})

export const chatIdParamsSchema = z.object({
  id: z.string().trim().min(1)
})

export const streamChatSchema = z.object({
  model: z.string().trim().min(1),
  messages: z.array(z.custom<UIMessage>()),
  thinkingEnabled: z.boolean().optional().default(true)
})

export const uploadChatParamsSchema = z.object({
  chatId: z.string().trim().min(1)
})

export const deleteChatAssetParamsSchema = z.object({
  pathname: z.string().trim().min(1)
})

export type CreateChatSchema = z.infer<typeof createChatSchema>
export type StreamChatSchema = z.infer<typeof streamChatSchema>
