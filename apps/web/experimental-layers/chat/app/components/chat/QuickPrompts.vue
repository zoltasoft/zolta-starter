<script setup lang="ts">
defineProps<{
  items: Array<{
    label: string
    icon: string
  }>
}>()

const emit = defineEmits<{
  select: [string]
}>()
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <UButton
      v-for="item in items"
      :key="item.label"
      :icon="item.icon"
      :label="item.label"
      size="sm"
      color="neutral"
      variant="outline"
      class="rounded-full"
      @click="emit('select', item.label)"
    />
  </div>
</template>
