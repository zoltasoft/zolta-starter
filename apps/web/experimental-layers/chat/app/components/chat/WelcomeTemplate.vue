<script setup lang="ts">
</script>

<template>
  <UDashboardPanel
    id="chat-home"
    class="min-h-0"
    :ui="{ body: 'p-0 sm:p-0' }"
  >
    <template #header>
      <ChatDashboardNavbar />
    </template>

    <template #body>
      <ChatWelcomePanel />
    </template>
  </UDashboardPanel>
</template>
