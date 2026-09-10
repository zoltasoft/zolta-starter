<script setup lang="ts">
import { useElementVisibility } from '@vueuse/core'

const props = defineProps<{
  loading: boolean
  hasMore: boolean
}>()

const emit = defineEmits<{
  loadMore: []
}>()

const sentinel = useTemplateRef<HTMLElement>('sentinel')
const visible = useElementVisibility(sentinel)

watch(
  [visible, () => props.loading, () => props.hasMore],
  ([isVisible, loading, hasMore]) => {
    if (isVisible && hasMore && !loading) emit('loadMore')
  },
  { immediate: true }
)
</script>

<template>
  <div
    ref="sentinel"
    class="flex min-h-12 items-center justify-center py-4"
    aria-live="polite"
  >
    <UProgress
      v-if="props.loading"
      indeterminate
      size="xs"
      class="w-full max-w-sm"
    />
  </div>
</template>
