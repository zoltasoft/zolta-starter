import type { CreateChatSchema, StreamChatSchema } from './chat.schema'
import type { chatClientService } from './chat.client.service'
import type { chatAssetService } from './chat.asset.service'
import type { chatCompletionService } from './chat.completion.service'
import { toChatSyncPayload } from './chat.sync'
import {
  buildChatAssetPrefix,
  isChatMessageRole,
  isOwnedChatAssetPath
} from './chat.types'

type ChatClient = Awaited<ReturnType<typeof chatClientService>>
type ChatAssetService = ReturnType<typeof chatAssetService>
type ChatCompletionService = ReturnType<typeof chatCompletionService>

type Principal = {
  id: string
  username: string
}

type CreateChatOperationsOptions = {
  principal: Principal
  chatClient?: ChatClient
  chatAssets: ChatAssetService
  chatCompletion: ChatCompletionService
  createHttpError?: (statusCode: number, statusMessage: string) => Error
}

function defaultCreateHttpError(statusCode: number, statusMessage: string) {
  return Object.assign(new Error(statusMessage), {
    statusCode,
    statusMessage
  })
}

const defaultChatClient: ChatClient = {
  async listChats() {
    return []
  },
  async getChatById() {
    return null
  },
  async deleteChat() {
    return null
  },
  async saveChat() {
    return {
      id: '',
      title: '',
      userId: '',
      documentId: null,
      messages: [],
      createdAt: new Date(0),
      updatedAt: new Date(0)
    }
  }
}

export function createChatOperations({
  principal,
  chatClient = defaultChatClient,
  chatAssets,
  chatCompletion,
  createHttpError = defaultCreateHttpError
}: CreateChatOperationsOptions) {
  const userId = String(principal.id)
  const ownerName = principal.username

  return {
    async listChats() {
      return await chatClient.listChats()
    },

    async createChat(input: CreateChatSchema) {
      const chat = await chatClient.saveChat({
        id: input.id,
        title: '',
        messages: [
          {
            role: 'user',
            message: input.message.parts
              .filter(part => part.type === 'text')
              .map(part => part.text)
              .filter((value): value is string => typeof value === 'string')
              .join('\n')
          }
        ]
      })

      return chat
    },

    async getChatById(id: string) {
      const chat = await chatClient.getChatById(id)

      if (!chat) {
        throw createHttpError(404, 'Chat not found')
      }

      return chat
    },

    async streamChatResponse(input: StreamChatSchema & { id: string }) {
      const chat = await chatClient.getChatById(input.id)

      if (!chat) {
        throw createHttpError(404, 'Chat not found')
      }

      const shouldGenerateTitle = !chat.title && Boolean(input.messages[0])
      let title = chat.title ?? ''

      if (shouldGenerateTitle && input.messages[0]) {
        title = await chatCompletion.generateTitle({
          firstMessage: input.messages[0]
        })
      }

      return chatCompletion.createResponseStream({
        model: input.model,
        messages: input.messages,
        thinkingEnabled: input.thinkingEnabled,
        userName: ownerName,
        onFinish: async (messages) => {
          const persistedMessages = [
            ...input.messages,
            ...messages
          ]
            // Keep only roles we persist.
            .filter(message => isChatMessageRole(message.role))
            .map(message => ({
              id: message.id,
              chatId: chat.id,
              role: message.role,
              parts: message.parts,
              createdAt: new Date(),
              updatedAt: new Date()
            }))

          if (persistedMessages.length === 0) {
            return
          }

          await chatClient.saveChat(toChatSyncPayload({
            ...chat,
            title,
            messages: persistedMessages
          }))
        }
      })
    },

    async authorizeChatUpload(chatId: string) {
      const chat = await chatClient.getChatById(chatId)

      if (chat && chat.userId !== userId) {
        throw createHttpError(
          403,
          'You do not have permission to upload files to this chat'
        )
      }

      return {
        prefix: buildChatAssetPrefix(ownerName, chatId)
      }
    },

    async deleteChatAsset(pathname: string) {
      if (!isOwnedChatAssetPath(pathname, ownerName)) {
        throw createHttpError(
          403,
          'You do not have permission to delete this file'
        )
      }

      await chatAssets.delete(pathname)
    },

    async deleteChat(id: string) {
      const chat = await chatClient.deleteChat(id)

      if (!chat) {
        throw createHttpError(404, 'Chat not found')
      }

      const prefix = buildChatAssetPrefix(ownerName, id)

      try {
        const assets = await chatAssets.listByPrefix(prefix)
        await Promise.all(
          assets.map(asset =>
            chatAssets.delete(asset.pathname).catch((error) => {
              console.error(
                '[delete-chat] Failed to delete file:',
                asset.pathname,
                error
              )
            })
          )
        )
      } catch (error) {
        console.error('Failed to list/delete chat files:', error)
      }

      return chat
    }
  }
}
