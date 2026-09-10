<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const switchLocalePath = useSwitchLocalePath()
const route = useRoute()
const { locale } = useI18n()

const supportedLocales = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' }
] as const

type SupportedLocale = (typeof supportedLocales)[number]['code']

const currentLocaleLabel = computed(() => locale.value.toUpperCase())

const items = computed<DropdownMenuItem[][]>(() => [
  supportedLocales.map(entry => ({
    label: entry.name,
    type: 'checkbox',
    checked: locale.value === entry.code,
    onUpdateChecked(checked: boolean) {
      if (!checked) return

      const path = switchLocalePath(entry.code as SupportedLocale)
      if (path && path !== route.fullPath) {
        return navigateTo(path)
      }
    }
  }))
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'end', collisionPadding: 8 }"
    :ui="{ content: 'min-w-40' }"
  >
    <UButton
      :label="currentLocaleLabel"
      trailing-icon="i-lucide-chevron-down"
      size="sm"
      variant="ghost"
      color="neutral"
      class="rounded-full"
    />
  </UDropdownMenu>
</template>
