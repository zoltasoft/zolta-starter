<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  confirmIcon?: string
  loading?: boolean
  color?: 'error' | 'primary' | 'warning'
}>(), {
  confirmIcon: 'i-lucide-check',
  loading: false,
  color: 'error'
})

const emit = defineEmits<{ confirm: [] }>()
const open = defineModel<boolean>({ default: false })

function close() {
  open.value = false
}

function confirm() {
  emit('confirm')
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="title"
    :description="description"
    :dismissible="!loading"
    :close="!loading"
  >
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton
          :label="cancelLabel"
          color="neutral"
          variant="ghost"
          :disabled="loading"
          @click="close"
        />
        <UButton
          :label="confirmLabel"
          :icon="confirmIcon"
          :color="color"
          :loading="loading"
          @click="confirm"
        />
      </div>
    </template>
  </UModal>
</template>
