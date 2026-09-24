<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()
const open = ref(false)

const closeSidebar = () => {
  open.value = false
}

const primaryLinks = computed<NavigationMenuItem[][]>(() => [[
  { label: t('projects.nav.overview'), icon: 'i-lucide-layout-dashboard', to: localePath('/projects/dashboard'), active: route.path === localePath('/projects/dashboard'), onSelect: closeSidebar },
  { label: t('projects.nav.tasks'), icon: 'i-lucide-list-checks', to: localePath('/projects/dashboard/tasks'), active: route.path.startsWith(localePath('/projects/dashboard/tasks')), onSelect: closeSidebar }
]])

const secondaryLinks = computed<NavigationMenuItem[][]>(() => [[
  { label: t('projects.nav.product'), icon: 'i-lucide-house', to: localePath('/projects'), onSelect: closeSidebar },
  { label: t('projects.nav.documentation'), icon: 'i-lucide-file-text', to: localePath('/'), onSelect: closeSidebar }
]])
</script>

<template>
  <div class="projects-theme min-h-screen">
    <DashboardShellFrame
      v-model:open="open"
      sidebar-id="projects-dashboard"
      :desktop-collapsed="true"
      :primary-links="primaryLinks"
      :secondary-links="secondaryLinks"
      :primary-navigation-label="t('projects.nav.primaryNavigation')"
      :secondary-navigation-label="t('projects.nav.secondaryNavigation')"
      :search-label="t('projects.nav.search')"
    >
      <template #sidebar-header="{ collapsed }">
        <NuxtLink
          :to="localePath('/projects/dashboard')"
          class="inline-flex rounded-lg transition hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
          :aria-label="t('projects.brand')"
        >
          <AppLogo
            :collapsed="collapsed"
            :brand="t('projects.brand')"
            icon="i-lucide-kanban-square"
            logo="/branding/zoltasoft-tasks.png"
          />
        </NuxtLink>
      </template>

      <template #sidebar-footer="{ collapsed }">
        <ProjectsUserMenu :collapsed="collapsed" />
      </template>

      <template #workspace>
        <slot />
      </template>
    </DashboardShellFrame>
  </div>
</template>
