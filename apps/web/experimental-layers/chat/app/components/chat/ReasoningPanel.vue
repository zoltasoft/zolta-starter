<script setup lang="ts">
const { isStreaming = false } = defineProps<{
  text: string
  isStreaming?: boolean
}>()

const open = ref(false)

watch(
  () => isStreaming,
  () => {
    open.value = isStreaming
  },
  { immediate: true }
)

function cleanMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^#+\s+/gm, '')
}
</script>

<template>
  <UCollapsible
    v-model:open="open"
    class="my-5 flex flex-col gap-1"
  >
    <UButton
      class="group p-0"
      color="neutral"
      variant="link"
      trailing-icon="i-lucide-chevron-down"
      :ui="{
        trailingIcon: text.length > 0 ? 'group-data-[state=open]:rotate-180 transition-transform duration-200' : 'hidden'
      }"
      :label="isStreaming ? 'Thinking...' : 'Thoughts'"
    />

    <template #content>
      <div
        v-for="(value, index) in cleanMarkdown(text).split('\n').filter(Boolean)"
        :key="index"
      >
        <span class="whitespace-pre-wrap text-sm text-muted font-normal">
          {{ value }}
        </span>
      </div>
    </template>
  </UCollapsible>
</template>
