<script setup lang="ts">
const props = defineProps<{
  icon: string
  title: string
  description: string
  actionLabel?: string
  actionIcon?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="flex w-full min-h-72 flex-1 items-center justify-center rounded-xl border border-dashed border-default bg-muted/15 px-6 text-center">
    <div class="flex max-w-xl flex-col items-center justify-center">
      <UIcon
        :name="props.icon"
        class="size-7 text-muted"
      />
      <h2 class="mt-4 text-sm font-semibold">
        {{ props.title }}
      </h2>
      <p class="mt-1 max-w-sm text-xs text-muted">
        {{ props.description }}
      </p>
      <UButton
        v-if="props.actionLabel"
        :label="props.actionLabel"
        :icon="props.actionIcon"
        class="mt-4"
        @click="emit('action')"
      />
    </div>
  </div>
</template>
