<script setup lang="ts">
withDefaults(defineProps<{
  collapsed?: boolean
  brand?: string
  icon?: string
}>(), {
  collapsed: false,
  brand: 'Zolta Starter',
  icon: 'i-lucide-sparkles'
})
</script>

<template>
  <div class="inline-flex items-center gap-2 text-highlighted">
    <span
      class="inline-flex size-7 items-center justify-center rounded-lg bg-primary text-white shadow-sm"
    >
      <UIcon
        :name="icon"
        class="size-4"
      />
    </span>

    <span
      v-if="!collapsed"
      class="text-sm font-semibold tracking-tight"
    >{{ brand }}</span>
  </div>
</template>
