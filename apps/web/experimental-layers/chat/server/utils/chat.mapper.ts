import type {
  ChatSummary,
  ChatConversation,
  ChatMessage,
  ChatMessageParts
} from './chat.types'

type ChatApiResponse = {
  id: string
  user_id: string
  document_id: string | null
  title: string | null
  messages: Array<{
    id: string
    role: 'user' | 'assistant' | 'system'
    message: string
  }>
  created_at: string
  updated_at: string
}

function toChatMessageResource(message: ChatMessage) {
  return {
    id: message.id,
    chatId: message.chatId,
    role: message.role,
    parts: message.parts,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString()
  }
}

const UI_PARTS_PREFIX = '__ui_parts__:'

function toMessageParts(message: string): ChatMessageParts {
  if (!message.startsWith(UI_PARTS_PREFIX)) {
    return [{ type: 'text', text: message }]
  }

  try {
    return JSON.parse(message.slice(UI_PARTS_PREFIX.length)) as ChatMessageParts
  } catch {
    return [{ type: 'text', text: message }]
  }
}

export function toChatResource(chat: ChatSummary) {
  return {
    id: chat.id,
    title: chat.title,
    userId: chat.userId,
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString()
  }
}

export function toChatsResource(chats: ChatSummary[]) {
  return chats.map(toChatResource)
}

export function toChatConversationResource(chat: ChatConversation) {
  return {
    ...toChatResource(chat),
    messages: chat.messages.map(toChatMessageResource)
  }
}

export function toChatSummary(chat: ChatApiResponse): ChatSummary {
  return {
    id: chat.id,
    title: chat.title,
    userId: chat.user_id,
    documentId: chat.document_id,
    createdAt: new Date(chat.created_at),
    updatedAt: new Date(chat.updated_at)
  }
}

export function toChatConversationFromApi(chat: ChatApiResponse): ChatConversation {
  return {
    ...toChatSummary(chat),
    messages: chat.messages.map(message => ({
      id: message.id,
      chatId: chat.id,
      role: message.role,
      parts: toMessageParts(message.message),
      createdAt: new Date(chat.created_at),
      updatedAt: new Date(chat.updated_at)
    }))
  }
}
