<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  icon?: string
}>(), {
  icon: 'i-lucide-layout-dashboard'
})
</script>

<template>
  <div class="flex min-w-0 items-center gap-2.5">
    <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <UIcon
        :name="icon"
        class="size-4"
      />
    </span>
    <span class="truncate">
      {{ title }}
    </span>
  </div>
</template>
