<script setup lang="ts">
const toast = useToast()
const { t } = useI18n()
const open = ref(false)
const localePath = useLocalePath()
const { primaryLinks, secondaryLinks, searchGroups }
  = useDashboardSidebarNavigation(
    () => {
      open.value = false
    }
  )

onMounted(async () => {
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted') {
    return
  }

  toast.add({
    title: t('dashboard.layout.cookie.title'),
    duration: 0,
    close: false,
    actions: [
      {
        label: t('dashboard.layout.cookie.accept'),
        color: 'neutral',
        variant: 'outline',
        onClick: () => {
          cookie.value = 'accepted'
        }
      },
      {
        label: t('dashboard.layout.cookie.optOut'),
        color: 'neutral',
        variant: 'ghost'
      }
    ]
  })
})
</script>

<template>
  <ShellFrame
    v-model:open="open"
    sidebar-id="default"
    :desktop-collapsed="true"
    :primary-links="primaryLinks"
    :secondary-links="secondaryLinks"
    :search-groups="searchGroups"
    :primary-navigation-label="t('dashboard.layout.accessibility.primaryNavigation')"
    :secondary-navigation-label="t('dashboard.layout.accessibility.secondaryNavigation')"
    :search-label="t('dashboard.layout.accessibility.search')"
  >
    <template #sidebar-header="{ collapsed }">
      <NuxtLink
        :to="localePath('/dashboard')"
        class="inline-flex rounded-lg transition hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
        :aria-label="t('dashboard.brandLabel')"
      >
        <AppLogo :collapsed="collapsed" />
      </NuxtLink>
    </template>

    <template #sidebar-footer="{ collapsed }">
      <AppSidebarFooter :collapsed="collapsed" />
    </template>

    <template #global-feedback>
      <TemporaryDemoBanner />
    </template>

    <slot />
  </ShellFrame>
</template>
