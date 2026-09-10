export function useChatThinking() {
  const thinkingEnabled = useCookie<boolean>('chat-thinking-enabled', {
    default: () => true
  })

  return {
    thinkingEnabled
  }
}
