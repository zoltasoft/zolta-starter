<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const open = ref(false)
const route = useRoute()
const localePath = useLocalePath()
const copy = useSaasTemplatePresentation()

const closeSidebar = () => {
  open.value = false
}

const primaryLinks = computed<NavigationMenuItem[][]>(() => [[
  {
    label: copy.value.dashboard.overview,
    icon: 'i-lucide-layout-dashboard',
    to: localePath('/saas/dashboard'),
    active: route.path === localePath('/saas/dashboard'),
    onSelect: closeSidebar
  },
  {
    label: copy.value.dashboard.settings,
    icon: 'i-lucide-settings',
    to: localePath('/saas/dashboard/settings'),
    active: route.path.startsWith(localePath('/saas/dashboard/settings')),
    onSelect: closeSidebar
  }
]])

const secondaryLinks = computed<NavigationMenuItem[][]>(() => [[
  {
    label: copy.value.dashboard.product,
    icon: 'i-lucide-globe',
    to: localePath('/saas'),
    onSelect: closeSidebar
  },
  {
    label: copy.value.dashboard.support,
    icon: 'i-lucide-circle-help',
    to: `${localePath('/saas')}#faq`,
    onSelect: closeSidebar
  }
]])
</script>

<template>
  <DashboardShellFrame
    v-model:open="open"
    sidebar-id="saas-dashboard"
    :desktop-collapsed="true"
    :primary-links="primaryLinks"
    :secondary-links="secondaryLinks"
    :primary-navigation-label="copy.dashboard.primaryNavigation"
    :secondary-navigation-label="copy.dashboard.secondaryNavigation"
    :search-label="copy.dashboard.search"
  >
    <template #sidebar-header="{ collapsed }">
      <NuxtLink
        :to="localePath('/saas/dashboard')"
        class="inline-flex rounded-lg transition hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
        :aria-label="copy.brand"
      >
        <SaasBrand :collapsed="collapsed" />
      </NuxtLink>
    </template>

    <template #sidebar-footer="{ collapsed }">
      <SaasUserMenu
        :collapsed="collapsed"
        home-to="/saas/dashboard"
        settings-to="/saas/dashboard/settings"
        login-redirect-to="/saas/dashboard"
      />
    </template>

    <slot />
  </DashboardShellFrame>
</template>
