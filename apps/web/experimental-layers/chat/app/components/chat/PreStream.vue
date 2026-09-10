<script setup lang="ts">
import { ShikiCachedRenderer } from 'shiki-stream/vue'

const colorMode = useColorMode()
const highlighter = await useHighlighter()
const props = defineProps<{
  code: string
  language: string
  class?: string
  meta?: string
}>()

const trimmedCode = computed(() => props.code.trim().replace(/`+$/, ''))
const lang = computed(() => {
  switch (props.language) {
    case 'javascript':
      return 'js'
    case 'typescript':
      return 'ts'
    default:
      return props.language
  }
})

const key = computed(() => `${lang.value}-${colorMode.value}`)
</script>

<template>
  <ProsePre v-bind="props">
    <ShikiCachedRenderer
      :key="key"
      :highlighter="highlighter"
      :code="trimmedCode"
      :lang="lang"
      :theme="colorMode.value === 'dark' ? 'material-theme-palenight' : 'material-theme-lighter'"
    />
  </ProsePre>
</template>
