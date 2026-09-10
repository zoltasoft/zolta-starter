import type { H3Event } from 'h3'

import { handleLaravelApiError, type LaravelEnvelope } from '#server/http'
import { toChatConversationFromApi, toChatSummary } from './chat.mapper'
import type { ChatConversation, ChatSummary } from './chat.types'

type SaveChatPayload = {
  id: string
  title?: string | null
  documentId?: string | null
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    message: string
  }>
}

type ChatApiResponse = {
  id: string
  user_id: string
  title: string | null
  document_id: string | null
  messages: Array<{
    id: string
    role: 'user' | 'assistant' | 'system'
    message: string
  }>
  created_at: string
  updated_at: string
}

export async function chatClientService(event: H3Event) {
  const client = await createEventLaravelClient(event)

  const listChats = async (documentId?: string): Promise<ChatSummary[]> => {
    try {
      const response = await client<LaravelEnvelope<{ chats: ChatApiResponse[] }>>('/api/chats', {
        query: documentId ? { document_id: documentId } : undefined
      })
      return response.data.chats.map(toChatSummary)
    } catch (error) {
      return handleLaravelApiError(error)
    }
  }

  const getChatById = async (id: string): Promise<ChatConversation | null> => {
    try {
      const response = await client<LaravelEnvelope<{ chat: ChatApiResponse }>>(`/api/chats/${id}`)
      return toChatConversationFromApi(response.data.chat)
    } catch (error) {
      return handleLaravelApiError(error, { notFoundAsNull: true })
    }
  }

  const deleteChat = async (id: string): Promise<ChatSummary | null> => {
    try {
      const response = await client<LaravelEnvelope<{ chat: ChatApiResponse }>>(`/api/chats/${id}`, {
        method: 'DELETE'
      })
      return toChatSummary(response.data.chat)
    } catch (error) {
      return handleLaravelApiError(error, { notFoundAsNull: true })
    }
  }

  const saveChat = async (body: SaveChatPayload): Promise<ChatConversation> => {
    try {
      const response = await client<LaravelEnvelope<{ chat: ChatApiResponse }>>('/api/chats', {
        method: 'POST',
        body: {
          ...body,
          document_id: body.documentId
        }
      })

      return toChatConversationFromApi(response.data.chat)
    } catch (error) {
      return handleLaravelApiError(error)
    }
  }

  return {
    listChats,
    getChatById,
    deleteChat,
    saveChat
  }
}
