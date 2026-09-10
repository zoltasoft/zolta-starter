<script setup lang="ts">
const props = withDefaults(defineProps<{
  accessibleLabel: string
  busy?: boolean
  previewClass?: string
  variant?: 'portrait' | 'landscape'
}>(), {
  busy: false,
  previewClass: 'aspect-[3/4] p-3',
  variant: 'portrait'
})

const emit = defineEmits<{
  activate: []
}>()
const slots = useSlots()
const hasPreview = computed(() => Boolean(slots.preview))

function activateFromKeyboard(event: KeyboardEvent) {
  if (event.target === event.currentTarget) emit('activate')
}
</script>

<template>
  <article
    role="link"
    tabindex="0"
    class="relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-default bg-default transition-[border-color,box-shadow,background-color] duration-150 hover:border-primary/50 hover:bg-elevated/70 hover:shadow-md hover:ring-1 hover:ring-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    :class="{ 'md:flex-row': props.variant === 'landscape' && hasPreview }"
    :aria-label="props.accessibleLabel"
    :aria-busy="props.busy"
    @click="emit('activate')"
    @keyup.enter="activateFromKeyboard"
  >
    <div
      v-if="hasPreview"
      class="w-full border-b border-default bg-muted/25"
      :class="[
        props.previewClass,
        props.variant === 'landscape' && hasPreview
          ? 'md:w-3/5 md:shrink-0 md:border-b-0 md:border-r'
          : ''
      ]"
    >
      <slot name="preview" />
    </div>

    <div
      class="mt-auto p-4"
      :class="props.variant === 'landscape' && hasPreview
        ? 'md:mt-0 md:flex md:w-2/5 md:items-stretch'
        : 'h-full w-full'"
    >
      <slot />
    </div>
  </article>
</template>
