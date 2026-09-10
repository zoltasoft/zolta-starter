<script setup lang="ts">
const colorMode = useColorMode()
const { locale } = useI18n()
const color = computed(() => colorMode.value === 'dark' ? '#171717' : '#ffffff')
const title = 'Zolta Starter'
const description = 'An open-source SaaS and dashboard starter for the Zolta ecosystem.'

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  htmlAttrs: { lang: locale }
})

useSeoMeta({ title, description, ogTitle: title, ogDescription: description, twitterCard: 'summary' })
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
