<script setup lang="ts">
const props = withDefaults(defineProps<{
  icon: string
  label: string
  active?: boolean
  disabled?: boolean
  loading?: boolean
}>(), {
  active: false,
  disabled: false,
  loading: false
})
</script>

<template>
  <UButton
    :icon="props.icon"
    :aria-label="props.label"
    :aria-pressed="props.active || undefined"
    :disabled="props.disabled"
    :loading="props.loading"
    color="neutral"
    :variant="props.active ? 'soft' : 'ghost'"
    size="sm"
    square
    class="size-8 shrink-0 rounded-lg text-muted transition-[color,background-color,box-shadow] hover:bg-elevated hover:text-highlighted focus-visible:ring-2 focus-visible:ring-primary"
    @click.stop
  />
</template>
