import type { ChatConversation, ChatMessage } from './chat.types'

function stringifyMessageParts(message: ChatMessage) {
  return serializeMessageParts(message.parts)
}

export function serializeMessageParts(parts: ChatMessage['parts']) {
  return `__ui_parts__:${JSON.stringify(parts)}`
}

export function toChatSyncPayload(chat: ChatConversation) {
  return {
    id: chat.id,
    title: chat.title,
    documentId: chat.documentId,
    messages: chat.messages
      .map(message => ({
        role: message.role,
        message: stringifyMessageParts(message)
      }))
      .filter(message => Boolean(message.message))
  }
}
