<script setup lang="ts">
defineProps<{
  collapsed: boolean
}>()

const session = useIdentitySession()
const isAuthenticated = computed(() => Boolean(session.user.value))
</script>

<template>
  <div
    class="flex gap-1"
    :class="collapsed ? 'flex-col items-center' : 'items-center'"
  >
    <NotificationsPopover
      v-if="isAuthenticated"
      :collapsed="collapsed"
    />
    <UserMenu
      :collapsed="collapsed"
      :class="collapsed ? '' : 'min-w-0 flex-1'"
    />
  </div>
</template>
