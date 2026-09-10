import type { UIMessage } from 'ai'

export type ChatMessageRole = 'user' | 'assistant' | 'system'
export type ChatMessageParts = UIMessage['parts']

export type ChatSummary = {
  id: string
  title: string | null
  userId: string
  documentId: string | null
  createdAt: Date
  updatedAt: Date
}

export type ChatMessage = {
  id: string
  chatId: string
  role: ChatMessageRole
  parts: ChatMessageParts
  createdAt: Date
  updatedAt: Date
}

export type ChatConversation = ChatSummary & {
  messages: ChatMessage[]
}

export function isChatMessageRole(value: string): value is ChatMessageRole {
  return value === 'user' || value === 'assistant' || value === 'system'
}

export function buildChatAssetPrefix(ownerName: string, chatId: string) {
  return `${ownerName}/${chatId}`
}

export function isOwnedChatAssetPath(pathname: string, ownerName: string) {
  return pathname.startsWith(`${ownerName}/`)
}
