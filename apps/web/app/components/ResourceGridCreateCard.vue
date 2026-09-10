<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  description: string
  disabled?: boolean
  variant?: 'portrait' | 'landscape'
}>(), {
  disabled: false,
  variant: 'portrait'
})

const emit = defineEmits<{
  activate: []
}>()
</script>

<template>
  <button
    type="button"
    class="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-default bg-muted/20 px-6 py-8 text-center transition hover:border-primary/50 hover:bg-primary/10 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
    :class="props.variant === 'landscape' ? 'min-h-52' : 'min-h-72'"
    :disabled="props.disabled"
    @click="emit('activate')"
  >
    <span class="flex size-12 items-center justify-center rounded-full bg-elevated text-muted ring-1 ring-default">
      <UIcon
        name="i-lucide-plus"
        class="size-5"
      />
    </span>
    <span class="mt-4 text-sm font-semibold text-highlighted">{{ props.title }}</span>
    <span class="mt-1 text-xs leading-5 text-muted">{{ props.description }}</span>
  </button>
</template>
