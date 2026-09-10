<script setup lang="ts">
const input = ref('')
const loading = ref(false)
const chatId = crypto.randomUUID()
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
} = useFileUploadWithStatus(chatId)

const quickChats = [
  { label: 'Why use Nuxt UI?', icon: 'i-logos-nuxt-icon' },
  { label: 'Help me create a Vue composable', icon: 'i-logos-vue' },
  { label: 'Tell me more about UnJS', icon: 'i-logos-unjs' },
  { label: 'Why should I consider VueUse?', icon: 'i-logos-vueuse' },
  { label: 'Tailwind CSS best practices', icon: 'i-logos-tailwindcss-icon' },
  { label: 'What is the weather in Bordeaux?', icon: 'i-lucide-sun' },
  { label: 'Show me a chart of sales data', icon: 'i-lucide-line-chart' }
]

async function createChat(prompt: string) {
  input.value = prompt
  loading.value = true

  try {
    const parts: Array<{
      type: string
      text?: string
      mediaType?: string
      url?: string
    }> = [{ type: 'text', text: prompt }]

    if (uploadedFiles.value.length > 0) {
      parts.push(...uploadedFiles.value)
    }

    const chat = await $fetch<{ id: string }>('/api/chats', {
      method: 'POST',
      headers: { [headerName]: csrf },
      body: {
        id: chatId,
        message: {
          role: 'user',
          parts
        }
      }
    })

    if (!chat.id) {
      throw new Error('The chat API did not return a chat ID')
    }

    await refreshNuxtData('chats')
    await navigateTo(`/chat/${chat.id}`)
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  await createChat(input.value)
  clearFiles()
}
</script>

<template>
  <div
    ref="dropzoneRef"
    class="flex flex-1"
  >
    <ChatDragDropOverlay :show="isDragging" />

    <UContainer class="chat-container flex flex-1 flex-col justify-center gap-4 py-8 sm:gap-6">
      <h1 class="text-3xl font-bold text-highlighted sm:text-4xl">
        How can I help you today?
      </h1>

      <UChatPrompt
        v-model="input"
        :status="loading ? 'streaming' : 'ready'"
        :disabled="isUploading"
        class="[view-transition-name:chat-prompt]"
        variant="subtle"
        :ui="{ base: 'px-1.5' }"
        @submit="onSubmit"
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
            color="neutral"
            size="sm"
            :disabled="isUploading"
          />
        </template>
      </UChatPrompt>

      <ChatQuickPrompts
        :items="quickChats"
        @select="createChat"
      />
    </UContainer>
  </div>
</template>

<style scoped>
.chat-container {
  --ui-container: var(--container-3xl);
}
</style>
