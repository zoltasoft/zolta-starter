<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { isNotificationsSlideoverOpen } = useDashboard()
const { t } = useI18n()
defineProps<{
  title?: string
}>()
const route = useRoute()
const localePath = useLocalePath()
const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: t('dashboard.page.actions.newMail'),
      icon: 'i-lucide-send',
      to: localePath('/dashboard/inbox')
    },
    {
      label: t('dashboard.page.actions.newCustomer'),
      icon: 'i-lucide-user-plus',
      to: localePath('/dashboard/customers')
    }
  ]
])
const navItems = computed(() => [
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

function openNotifications() {
  isNotificationsSlideoverOpen.value = true
}
</script>

<template>
  <UDashboardPanel :id="title?.toLocaleLowerCase()">
    <template #header>
      <UDashboardNavbar
        :ui="{ right: 'gap-3' }"
      >
        <template
          v-if="title"
          #title
        >
          <PageTitle
            :title="title"
            icon="i-lucide-layout-dashboard"
          />
        </template>

        <template #right>
          <UNavigationMenu
            :items="navItems"
            variant="link"
            :aria-label="t('dashboard.panel.navigationLabel')"
          />
          <UTooltip
            :text="t('dashboard.panel.notifications.tooltip')"
            :shortcuts="['N']"
          >
            <UButton
              color="neutral"
              variant="ghost"
              square
              :aria-label="t('dashboard.panel.notifications.open')"
              @click="openNotifications"
            >
              <UChip
                color="success"
                inset
              >
                <UIcon
                  name="i-lucide-bell"
                  class="size-5 shrink-0"
                />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="items">
            <UButton
              icon="i-lucide-plus"
              size="md"
              class="rounded-full"
              :aria-label="t('dashboard.panel.actions.openMenu')"
            />
          </UDropdownMenu>
          <DashboardLanguageSwitcher />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
          <slot name="dashboard-toolbar-left" />
        </template>
        <template #right>
          <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
          <slot name="dashboard-toolbar-right" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <slot name="dashboard-body" />
    </template>
  </UDashboardPanel>
</template>
