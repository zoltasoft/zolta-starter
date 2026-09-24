<script setup lang="ts">
withDefaults(defineProps<{
  collapsed?: boolean
}>(), {
  collapsed: false
})
</script>

<template>
  <span class="inline-flex items-center gap-2 text-highlighted">
    <img
      src="/branding/zoltasoft-saas.png"
      alt=""
      aria-hidden="true"
      class="size-8 shrink-0 object-contain"
    >
    <span
      v-if="!collapsed"
      class="text-sm font-semibold tracking-tight"
    >Zoltasoft SaaS</span>
  </span>
</template>
