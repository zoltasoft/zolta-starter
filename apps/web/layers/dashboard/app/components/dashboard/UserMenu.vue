<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const props = withDefaults(defineProps<{
  collapsed?: boolean
  homeTo?: string
  settingsTo?: string
  loginTo?: string
  loginRedirectTo?: string
}>(), {
  collapsed: false,
  homeTo: '/dashboard',
  settingsTo: '/dashboard/settings',
  loginTo: '/auth/login'
})

const colorMode = useColorMode()
const session = useIdentitySession()
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

const localizedHomeTo = computed(() => localePath(props.homeTo))
const localizedSettingsTo = computed(() => localePath(props.settingsTo))
const localizedLoginTo = computed(() => localePath(props.loginTo))
const localizedLoginRedirectTo = computed(() => props.loginRedirectTo ? localePath(props.loginRedirectTo) : undefined)
const showDashboardItem = computed(() => route.path !== localizedHomeTo.value)

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
            to: localizedHomeTo.value
          }
        ]
      : []),
    // {
    //   label: t("userMenu.profile"),
    //   icon: "i-lucide-user",
    // },
    // {
    //   label: "Billing",
    //   icon: "i-lucide-credit-card",
    // },
    {
      label: t('userMenu.settings'),
      icon: 'i-lucide-settings',
      to: localizedSettingsTo.value
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
    // {
    //   label: "Theme",
    //   icon: "i-lucide-palette",
    //   children: [
    //     {
    //       label: "Primary",
    //       slot: "chip",
    //       chip: appConfig.ui.colors.primary,
    //       content: {
    //         align: "center",
    //         collisionPadding: 16,
    //       },
    //       children: colors.map((color) => ({
    //         label: color,
    //         chip: color,
    //         slot: "chip",
    //         checked: appConfig.ui.colors.primary === color,
    //         type: "checkbox",
    //         onSelect: (e) => {
    //           e.preventDefault()

    //           appConfig.ui.colors.primary = color
    //         },
    //       })),
    //     },
    //     {
    //       label: "Neutral",
    //       slot: "chip",
    //       chip:
    //         appConfig.ui.colors.neutral === "neutral"
    //           ? "old-neutral"
    //           : appConfig.ui.colors.neutral,
    //       content: {
    //         align: "end",
    //         collisionPadding: 16,
    //       },
    //       children: neutrals.map((color) => ({
    //         label: color,
    //         chip: color === "neutral" ? "old-neutral" : color,
    //         slot: "chip",
    //         type: "checkbox",
    //         checked: appConfig.ui.colors.neutral === color,
    //         onSelect: (e) => {
    //           e.preventDefault()

    //           appConfig.ui.colors.neutral = color
    //         },
    //       })),
    //     },
    //   ],
    // },
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
  // [
  //   {
  //     label: "Templates",
  //     icon: "i-lucide-layout-template",
  //     children: [
  //       {
  //         label: "Starter",
  //         to: "https://starter-template.nuxt.dev/",
  //       },
  //       {
  //         label: "Landing",
  //         to: "https://landing-template.nuxt.dev/",
  //       },
  //       {
  //         label: "Docs",
  //         to: "https://docs-template.nuxt.dev/",
  //       },
  //       {
  //         label: "SaaS",
  //         to: "https://saas-template.nuxt.dev/",
  //       },
  //       {
  //         label: "Dashboard",
  //         to: "https://dashboard-template.nuxt.dev/",
  //         color: "primary",
  //         checked: true,
  //         type: "checkbox",
  //       },
  //       {
  //         label: "Chat",
  //         to: "https://chat-template.nuxt.dev/",
  //       },
  //       {
  //         label: "Zoltasoft",
  //         to: "https://zoltasoft-template.nuxt.dev/",
  //       },
  //       {
  //         label: "Changelog",
  //         to: "https://changelog-template.nuxt.dev/",
  //       },
  //     ],
  //   },
  // ],
  [
    // {
    //   label: "Documentation",
    //   icon: "i-lucide-book-open",
    //   to: "https://ui.nuxt.com/docs/getting-started/installation/nuxt",
    //   target: "_blank",
    // },
    // {
    //   label: "GitHub repository",
    //   icon: "i-simple-icons-github",
    //   to: "https://github.com/nuxt-ui-templates/dashboard",
    //   target: "_blank",
    // },
    {
      label: t('userMenu.logout'),
      icon: 'i-lucide-log-out',
      async onSelect(e?: Event) {
        e?.preventDefault()

        const destination = localizedLoginRedirectTo.value
          ? `${localizedLoginTo.value}?redirect=${encodeURIComponent(localizedLoginRedirectTo.value)}`
          : localizedLoginTo.value
        await session.clear(destination)
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
  <UDropdownMenu
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
