<script setup lang="ts">
import { getFileIcon, removeRandomSuffix } from '#chat/shared/utils'

interface ChatFileAvatarProps {
  name: string
  type: string
  previewUrl?: string
  status?: 'idle' | 'uploading' | 'uploaded' | 'error'
  error?: string
  removable?: boolean
}

withDefaults(defineProps<ChatFileAvatarProps>(), {
  status: 'idle',
  removable: false
})

const emit = defineEmits<{
  remove: []
}>()
</script>

<template>
  <div class="relative group">
    <UTooltip :text="removeRandomSuffix(name)">
      <UAvatar
        size="2xl"
        :src="type.startsWith('image/') ? previewUrl : undefined"
        :icon="getFileIcon(type, name)"
        class="rounded-lg"
        :class="{ 'opacity-50': status === 'uploading' }"
      />
    </UTooltip>

    <div
      v-if="status === 'uploading'"
      class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="size-6 animate-spin text-white"
      />
    </div>

    <UTooltip
      v-if="status === 'error'"
      :text="error"
    >
      <div
        class="absolute inset-0 flex items-center justify-center rounded-lg bg-error/50"
      >
        <UIcon
          name="i-lucide-alert-circle"
          class="size-6 text-white"
        />
      </div>
    </UTooltip>

    <UButton
      v-if="removable && status !== 'uploading'"
      icon="i-lucide-x"
      size="xs"
      color="neutral"
      class="absolute -top-1 -right-1 rounded-full p-0 opacity-0 ring ring-bg transition-opacity group-hover:opacity-100"
      @click="emit('remove')"
    />
  </div>
</template>
