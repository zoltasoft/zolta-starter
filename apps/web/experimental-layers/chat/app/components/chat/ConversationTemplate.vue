<script setup lang="ts">
</script>

<template>
  <UDashboardPanel
    id="chat-conversation"
    class="relative min-h-0"
    :ui="{ body: 'p-0 sm:p-0 overscroll-none' }"
  >
    <template #header>
      <ChatDashboardNavbar />
    </template>

    <template #body>
      <ChatConversationPanel />
    </template>
  </UDashboardPanel>
</template>
