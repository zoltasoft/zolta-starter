<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const open = ref(false)
const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()

const closeSidebar = () => {
  open.value = false
}

const primaryLinks = computed<NavigationMenuItem[][]>(() => [[
  {
    label: t('dashboard.overview'),
    icon: 'i-lucide-layout-dashboard',
    to: localePath('/dashboard'),
    active: route.path === localePath('/dashboard'),
    onSelect: closeSidebar
  },
  {
    label: t('dashboard.settings'),
    icon: 'i-lucide-settings',
    to: localePath('/dashboard/settings'),
    active: route.path.startsWith(localePath('/dashboard/settings')),
    onSelect: closeSidebar
  }
]])

const secondaryLinks = computed<NavigationMenuItem[][]>(() => [[
  {
    label: t('dashboard.product'),
    icon: 'i-lucide-globe',
    to: localePath('/saas'),
    onSelect: closeSidebar
  },
  {
    label: t('dashboard.support'),
    icon: 'i-lucide-circle-help',
    to: `${localePath('/saas')}#faq`,
    onSelect: closeSidebar
  }
]])
</script>

<template>
  <div class="saas-theme min-h-screen">
    <DashboardShellFrame
      v-model:open="open"
      sidebar-id="dashboard"
      :desktop-collapsed="true"
      :primary-links="primaryLinks"
      :secondary-links="secondaryLinks"
      :primary-navigation-label="t('dashboard.primaryNavigation')"
      :secondary-navigation-label="t('dashboard.secondaryNavigation')"
      :search-label="t('dashboard.search')"
    >
      <template #sidebar-header="{ collapsed }">
        <NuxtLink
          :to="localePath('/dashboard')"
          class="inline-flex rounded-lg transition hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
          :aria-label="t('dashboard.brand')"
        >
          <AppLogo
            :collapsed="collapsed"
            logo="/branding/zoltasoft-saas.png"
            :brand="t('dashboard.brand')"
          />
        </NuxtLink>
      </template>

      <template #sidebar-footer="{ collapsed }">
        <DashboardUserMenu
          :collapsed="collapsed"
          home-to="/dashboard"
          settings-to="/dashboard/settings"
          login-redirect-to="/dashboard"
        />
      </template>

      <slot />
    </DashboardShellFrame>
  </div>
</template>
