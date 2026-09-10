<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
  icon?: string
}>()
</script>

<template>
  <div class="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5">
    <span
      v-if="props.icon"
      class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-elevated text-muted"
    >
      <UIcon
        :name="props.icon"
        class="size-4"
      />
    </span>

    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2">
        <p class="text-sm font-medium text-highlighted">
          {{ props.title }}
        </p>
        <slot name="meta" />
      </div>
      <p
        v-if="props.description"
        class="mt-0.5 text-xs leading-5 text-muted"
      >
        {{ props.description }}
      </p>
    </div>

    <div
      v-if="$slots.action"
      class="shrink-0"
    >
      <slot name="action" />
    </div>
  </div>
</template>
