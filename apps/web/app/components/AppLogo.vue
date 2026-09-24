<script setup lang="ts">
withDefaults(defineProps<{
  collapsed?: boolean
  brand?: string
  icon?: string
  logo?: string | null
}>(), {
  collapsed: false,
  brand: 'Zoltasoft Starter',
  icon: 'i-lucide-sparkles',
  logo: null
})
</script>

<template>
  <div class="inline-flex items-center gap-2 text-highlighted">
    <img
      v-if="logo"
      :src="logo"
      alt=""
      aria-hidden="true"
      class="size-7 object-contain"
    >
    <span
      v-else
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
