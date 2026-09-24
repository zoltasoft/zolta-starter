<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { collapsed } = withDefaults(defineProps<{ collapsed?: boolean }>(), { collapsed: false })
const colorMode = useColorMode()
const session = useProjectsIdentitySession()
const localePath = useLocalePath()
const { t } = useI18n()

const user = computed(() => {
  const value = session.user.value as { name?: string, username?: string, email?: string } | null
  const name = value?.name || value?.username || t('userMenu.authenticatedUser')

  return {
    label: name,
    email: value?.email || '',
    avatar: { text: name.slice(0, 2).toUpperCase(), alt: name }
  }
})

function selectLight(event: Event) {
  event.preventDefault()
  colorMode.preference = 'light'
}

function selectDark(event: Event) {
  event.preventDefault()
  colorMode.preference = 'dark'
}

async function logout(event?: Event) {
  event?.preventDefault()
  await session.clear(localePath('/projects'))
}

const items = computed<DropdownMenuItem[][]>(() => [
  [{ type: 'label', label: user.value.label, description: user.value.email || undefined, avatar: user.value.avatar }],
  [
    { label: t('projects.nav.product'), icon: 'i-lucide-house', to: localePath('/projects') },
    { label: t('userMenu.settings'), icon: 'i-lucide-settings', to: localePath('/projects/dashboard/settings') },
    {
      label: t('userMenu.appearance'),
      icon: 'i-lucide-sun-moon',
      children: [
        { label: t('userMenu.light'), icon: 'i-lucide-sun', type: 'checkbox', checked: colorMode.value === 'light', onSelect: selectLight },
        { label: t('userMenu.dark'), icon: 'i-lucide-moon', type: 'checkbox', checked: colorMode.value === 'dark', onSelect: selectDark }
      ]
    }
  ],
  [{ label: t('projects.nav.logout'), icon: 'i-lucide-log-out', onSelect: logout }]
])

onMounted(async () => {
  if (!session.ready.value) await session.fetch()
})
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{ ...user, label: collapsed ? undefined : user.label, trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down' }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{ trailingIcon: 'text-dimmed' }"
    />
  </UDropdownMenu>
</template>
