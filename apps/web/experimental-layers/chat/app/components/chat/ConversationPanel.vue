<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { getTextFromMessage } from '@nuxt/ui/utils/ai'
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'
import type { UIMessage } from 'ai'

const route = useRoute()
const toast = useToast()
const clipboard = useClipboard()
const { model } = useModels()
const { thinkingEnabled } = useChatThinking()
const { csrf, headerName } = useCsrf()

const {
  dropzoneRef,
  isDragging,
  open,
  files,
  isUploading,
  uploadedFiles,
  removeFile,
  clearFiles
} = useFileUploadWithStatus(route.params.id as string)

const { data } = await useFetch(`/api/chats/${route.params.id}`, {
  cache: 'force-cache'
})

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
}

const input = ref('')
const copied = ref(false)

const showPendingAssistantMessage = computed(() => {
  if (chat.status === 'ready' || chat.status === 'error') {
    return false
  }

  const lastMessage = chat.messages.at(-1)

  if (!lastMessage || lastMessage.role !== 'assistant') {
    return true
  }

  return !lastMessage.parts.some((part) => {
    if (part.type === 'reasoning') {
      return part.text.trim().length > 0
    }

    if (part.type === 'text') {
      return part.text.trim().length > 0
    }

    return part.type === 'tool-weather'
      || part.type === 'tool-chart'
      || part.type === 'file'
  })
})

const chat = new Chat({
  id: data.value.id,
  messages: data.value.messages,
  transport: new DefaultChatTransport({
    api: `/api/chats/${data.value.id}`,
    headers: { [headerName]: csrf },
    prepareSendMessagesRequest: ({ id, messageId, messages, trigger }) => ({
      body: {
        id,
        messageId,
        messages,
        trigger,
        model: model.value,
        thinkingEnabled: thinkingEnabled.value
      }
    })
  }),
  onFinish: async () => {
    await refreshNuxtData('chats')
  },
  onError(error) {
    const parsedError
      = typeof error.message === 'string' && error.message[0] === '{'
        ? JSON.parse(error.message)
        : error
    const message = 'message' in parsedError ? parsedError.message : error.message

    toast.add({
      description: message,
      icon: 'i-lucide-alert-circle',
      color: 'error',
      duration: 0
    })
  }
})

async function handleSubmit(event: Event) {
  event.preventDefault()

  if (input.value.trim() && !isUploading.value) {
    chat.sendMessage({
      text: input.value,
      files: uploadedFiles.value.length > 0 ? uploadedFiles.value : undefined
    })
    input.value = ''
    clearFiles()
  }
}

function copy(_event: MouseEvent, message: UIMessage) {
  clipboard.copy(getTextFromMessage(message))
  copied.value = true

  setTimeout(() => {
    copied.value = false
  }, 2000)
}

onMounted(() => {
  if (data.value?.messages.length === 1) {
    chat.regenerate()
  }
})
</script>

<template>
  <div
    ref="dropzoneRef"
    class="flex flex-1"
  >
    <ChatDragDropOverlay :show="isDragging" />

    <UContainer class="chat-container flex flex-1 flex-col gap-4 sm:gap-6">
      <UChatMessages
        should-auto-scroll
        :messages="chat.messages"
        :status="chat.status"
        :assistant="chat.status !== 'streaming'
          ? { actions: [{ label: 'Copy', icon: copied ? 'i-lucide-copy-check' : 'i-lucide-copy', onClick: copy }] }
          : { actions: [] }"
        :spacing-offset="160"
        class="pb-4 lg:pt-(--ui-header-height) sm:pb-6"
      >
        <template #content="{ message }">
          <ChatMessageContent :message="message" />
        </template>
      </UChatMessages>

      <div
        v-if="showPendingAssistantMessage"
        class="flex items-center gap-2 px-4 text-sm text-muted"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-4 animate-spin"
        />
        <span>Thinking...</span>
      </div>

      <UChatPrompt
        v-model="input"
        :error="chat.error"
        :disabled="isUploading"
        variant="subtle"
        class="sticky bottom-0 z-10 rounded-b-none [view-transition-name:chat-prompt]"
        :ui="{ base: 'px-1.5' }"
        @submit="handleSubmit"
      >
        <template
          v-if="files.length > 0"
          #header
        >
          <ChatFileList
            :files="files"
            removable
            @remove="removeFile"
          />
        </template>

        <template #footer>
          <div class="flex items-center gap-1">
            <ChatFileUploadButton :open="open" />
            <ChatModelSelect />
            <ChatThinkingToggle />
          </div>

          <UChatPromptSubmit
            :status="chat.status"
            :disabled="isUploading"
            color="neutral"
            size="sm"
            @stop="chat.stop()"
            @reload="chat.regenerate()"
          />
        </template>
      </UChatPrompt>
    </UContainer>
  </div>
</template>

<style scoped>
.chat-container {
  --ui-container: var(--container-3xl);
}
</style>
