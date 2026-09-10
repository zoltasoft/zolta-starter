<script setup lang="ts">
import type { DefineComponent } from 'vue'
import type { UIMessage } from 'ai'

import type { ChartUIToolInvocation, WeatherUIToolInvocation } from '#chat/shared/utils'
import PreStream from './PreStream.vue'

defineProps<{
  message: UIMessage
}>()

const components = {
  pre: PreStream as unknown as DefineComponent
}

function getFileName(url: string) {
  try {
    const urlObject = new URL(url)
    const pathname = urlObject.pathname
    const filename = pathname.split('/').pop() || 'file'

    return decodeURIComponent(filename)
  } catch {
    return 'file'
  }
}
</script>

<template>
  <template
    v-for="(part, index) in message.parts"
    :key="`${message.id}-${part.type}-${index}${'state' in part ? `-${part.state}` : ''}`"
  >
    <ChatReasoningPanel
      v-if="part.type === 'reasoning'"
      :text="part.text"
      :is-streaming="part.state !== 'done'"
    />
    <MDCCached
      v-else-if="part.type === 'text' && message.role === 'assistant'"
      :value="part.text"
      :cache-key="`${message.id}-${index}`"
      :components="components"
      :parser-options="{ highlight: false }"
      class="*:first:mt-0 *:last:mb-0"
    />
    <p
      v-else-if="part.type === 'text' && message.role === 'user'"
      class="whitespace-pre-wrap"
    >
      {{ part.text }}
    </p>
    <ChatWeatherToolCard
      v-else-if="part.type === 'tool-weather'"
      :invocation="part as WeatherUIToolInvocation"
    />
    <ChatChartToolCard
      v-else-if="part.type === 'tool-chart'"
      :invocation="part as ChartUIToolInvocation"
    />
    <ChatFileAvatar
      v-else-if="part.type === 'file'"
      :name="getFileName(part.url)"
      :type="part.mediaType"
      :preview-url="part.url"
      class="inline-flex"
    />
  </template>
</template>
