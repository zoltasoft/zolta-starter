<script setup lang="ts">
const props = withDefaults(defineProps<{
  accessibleLabel: string
  busy?: boolean
  disabled?: boolean
  role?: 'link' | 'option'
  selected?: boolean
}>(), {
  busy: false,
  disabled: false,
  role: 'link',
  selected: false
})

const emit = defineEmits<{
  activate: []
}>()

function activateFromKeyboard(event: KeyboardEvent) {
  if (!props.disabled && event.target === event.currentTarget) emit('activate')
}

function activate() {
  if (!props.disabled) emit('activate')
}
</script>

<template>
  <article
    :role="props.role"
    :tabindex="props.disabled ? -1 : 0"
    class="group relative flex cursor-pointer items-center gap-3 bg-default p-3 transition-colors hover:bg-elevated/60 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:gap-4 sm:p-4"
    :class="[
      props.selected ? 'bg-primary/5' : '',
      props.disabled ? 'cursor-default opacity-70 hover:bg-default' : ''
    ]"
    :aria-label="props.accessibleLabel"
    :aria-busy="props.busy"
    :aria-disabled="props.disabled || undefined"
    :aria-selected="props.role === 'option' ? props.selected : undefined"
    @click="activate"
    @keyup.enter="activateFromKeyboard"
  >
    <slot />
  </article>
</template>
