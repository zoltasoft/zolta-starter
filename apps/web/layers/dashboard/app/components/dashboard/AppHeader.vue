<script setup lang="ts">
const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()
const items = computed(() => [
  {
    label: t('saas.nav.docs'),
    to: localePath('/docs'),
    active: route.path.startsWith(localePath('/docs'))
  },
  {
    label: t('saas.nav.pricing'),
    to: localePath('/saas/pricing')
  },
  {
    label: t('saas.nav.blog'),
    to: localePath('/landing/blog')
  },
  {
    label: t('saas.nav.changelog'),
    to: localePath('/saas/changelog')
  }
])
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <SaasAppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>
      <SaasTemplateMenu />
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
    />

    <template #right>
      <UColorModeButton />
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>
