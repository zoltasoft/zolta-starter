<script setup lang="ts">
const colorMode = useColorMode()
const { locale } = useI18n()
const color = computed(() => colorMode.value === 'dark' ? '#171717' : '#ffffff')
const title = 'Zoltasoft Starter'
const description = 'A product-neutral Nuxt foundation for the Zoltasoft ecosystem.'

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  htmlAttrs: { lang: locale }
})

useSeoMeta({
  title,
  description,
  applicationName: title,
  ogTitle: title,
  ogDescription: description,
  ogSiteName: title,
  twitterCard: 'summary',
  twitterTitle: title,
  twitterDescription: description
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
