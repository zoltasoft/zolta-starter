<script setup lang="ts">
withDefaults(defineProps<{
  collapsed?: boolean
}>(), {
  collapsed: false
})
</script>

<template>
  <span class="inline-flex items-center gap-2 text-highlighted">
    <span class="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-white shadow-sm">
      <UIcon
        name="i-lucide-orbit"
        class="size-4"
      />
    </span>
    <span
      v-if="!collapsed"
      class="text-sm font-semibold tracking-tight"
    >Zolta Starter</span>
  </span>
</template>
