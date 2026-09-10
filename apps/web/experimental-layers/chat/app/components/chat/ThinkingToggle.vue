<script setup lang="ts">
const { thinkingEnabled } = useChatThinking()
</script>

<template>
  <div class="flex items-center gap-2 px-1">
    <USwitch
      v-model="thinkingEnabled"
      size="sm"
    />
    <span class="text-xs text-muted">
      Thinking
    </span>
  </div>
</template>
