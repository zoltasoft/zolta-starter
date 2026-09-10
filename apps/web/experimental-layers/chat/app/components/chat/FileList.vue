<script setup lang="ts">
import type { FileWithStatus } from '#chat/shared/utils'

defineProps<{
  files: FileWithStatus[]
  removable?: boolean
}>()

const emit = defineEmits<{
  remove: [string]
}>()
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <ChatFileAvatar
      v-for="fileWithStatus in files"
      :key="fileWithStatus.id"
      :name="fileWithStatus.file.name"
      :type="fileWithStatus.file.type"
      :preview-url="fileWithStatus.previewUrl"
      :status="fileWithStatus.status"
      :error="fileWithStatus.error"
      :removable="removable"
      @remove="emit('remove', fileWithStatus.id)"
    />
  </div>
</template>
