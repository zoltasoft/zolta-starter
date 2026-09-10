<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const colorMode = useColorMode()
const auth = useAuthenticationState()
const { session, logout, login } = auth
const route = useRoute()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const { locale, t } = useI18n()

const supportedLocales = [
  { code: 'en', labelKey: 'userMenu.locales.en' },
  { code: 'fr', labelKey: 'userMenu.locales.fr' }
] as const
type SupportedLocale = (typeof supportedLocales)[number]['code']

const user = computed(() => {
  const sessionUser = session.user.value as {
    name?: string
    email?: string
    avatar?: string
  } | null
  const name = sessionUser?.name || t('userMenu.authenticatedUser')
  const email = sessionUser?.email || ''

  return {
    name,
    email,
    avatar: {
      src:
        sessionUser?.avatar
        || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0D8ABC&color=fff`,
      alt: name
    }
  }
})

const isAuthenticated = computed(() => Boolean(session.user.value))

const showDashboardItem = computed(() => !route.path.startsWith(localePath('/dashboard')))

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: 'label',
      label: user.value.name,
      description: user.value.email || undefined,
      avatar: user.value.avatar,
      ui: {
        itemDescription: 'text-muted text-xs'
      }
    }
  ],
  [
    ...(showDashboardItem.value
      ? [
          {
            label: t('userMenu.home'),
            icon: 'i-lucide-house',
            to: localePath('/dashboard')
          }
        ]
      : []),
    // {
    //   label: t("userMenu.profile"),
    //   icon: "i-lucide-user",
    // },
    {
      label: t('userMenu.settings'),
      icon: 'i-lucide-settings',
      to: localePath('/dashboard/settings')
    }
  ],
  [
    {
      label: t('userMenu.language'),
      icon: 'i-lucide-languages',
      children: supportedLocales.map(entry => ({
        label: t(entry.labelKey),
        type: 'checkbox',
        checked: locale.value === entry.code,
        onUpdateChecked(checked: boolean) {
          if (!checked) {
            return
          }

          const path = switchLocalePath(entry.code as SupportedLocale)
          if (path && path !== route.fullPath) {
            return navigateTo(path)
          }
        }
      }))
    },
    {
      label: t('userMenu.appearance'),
      icon: 'i-lucide-sun-moon',
      children: [
        {
          label: t('userMenu.light'),
          icon: 'i-lucide-sun',
          type: 'checkbox',
          checked: colorMode.value === 'light',
          onSelect(e: Event) {
            e.preventDefault()

            colorMode.preference = 'light'
          }
        },
        {
          label: t('userMenu.dark'),
          icon: 'i-lucide-moon',
          type: 'checkbox',
          checked: colorMode.value === 'dark',
          onUpdateChecked(checked: boolean) {
            if (checked) {
              colorMode.preference = 'dark'
            }
          },
          onSelect(e: Event) {
            e.preventDefault()
          }
        }
      ]
    }
  ],
  [
    {
      label: t('userMenu.logout'),
      icon: 'i-lucide-log-out',
      async onSelect(e?: Event) {
        e?.preventDefault()
        logout()
      }
    }
  ]
])

onMounted(async () => {
  if (!session.ready.value) {
    await session.fetch()
  }
})
</script>

<template>
  <UButton
    v-if="!isAuthenticated"
    :label="collapsed ? undefined : t('auth.login.seo.title')"
    icon="i-lucide-log-in"
    color="neutral"
    variant="ghost"
    block
    :square="collapsed"
    :aria-label="collapsed ? t('auth.login.seo.title') : undefined"
    @click="login(route.fullPath)"
  />

  <UDropdownMenu
    v-else
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{
      content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)'
    }"
  >
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed'
      }"
    />

    <template #chip-leading="{ item }">
      <div class="inline-flex items-center justify-center shrink-0 size-5">
        <span
          class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2"
          :style="{
            '--chip-light': `var(--color-${(item as any).chip}-500)`,
            '--chip-dark': `var(--color-${(item as any).chip}-400)`
          }"
        />
      </div>
    </template>
  </UDropdownMenu>
</template>
