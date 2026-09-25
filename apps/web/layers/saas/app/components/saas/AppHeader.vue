<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const copy = useSaasTemplatePresentation()
const localePath = useLocalePath()
const route = useRoute()
const { session, login } = useSaasAuthenticationState()

// <UButton
//   v-if="!isAuthenticated"
//   :label="collapsed ? undefined : t('auth.login.seo.title')"
//   icon="i-lucide-log-in"
//   color="neutral"
//   variant="ghost"
//   block
//   :square="collapsed"
//   :aria-label="collapsed ? t('auth.login.seo.title') : undefined"
//   @click="login(route.fullPath)"
// />

const dashboardPath = computed(() => localePath('/dashboard'))
const items = computed<NavigationMenuItem[]>(() => [
  {
    label: copy.value.navigation.product,
    to: `${localePath('/saas')}#features`,
    active: route.path === localePath('/saas') && route.hash === '#features'
  },
  {
    label: copy.value.navigation.pricing,
    to: localePath('/saas/pricing'),
    active: route.path === localePath('/saas/pricing')
  },
  {
    label: copy.value.navigation.changelog,
    to: localePath('/saas/changelog'),
    active: route.path === localePath('/saas/changelog')
  }
])
</script>

<template>
  <UHeader :ui="{ container: 'max-w-7xl' }">
    <template #left>
      <NuxtLink
        :to="localePath('/saas')"
        class="rounded-lg focus-visible:outline-2 focus-visible:outline-primary"
      >
        <SaasBrand />
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="items"
      class="hidden lg:flex"
    />

    <template #right>
      <LanguageSwitcher />
      <UColorModeButton
        color="neutral"
        variant="ghost"
      />
      <UButton
        v-if="session.loggedIn.value"
        :label="copy.navigation.dashboard"
        :to="dashboardPath"
        trailing-icon="i-lucide-arrow-right"
        class="hidden sm:inline-flex"
      />
      <template v-else>
        <UButton
          :label="copy.navigation.login"
          color="neutral"
          variant="ghost"
          class="hidden sm:inline-flex"
          @click="login()"
        />
        <UButton
          :label="copy.navigation.start"
          trailing-icon="i-lucide-arrow-right"
          class="hidden sm:inline-flex"
          @click="login(undefined, 'register')"
        />
      </template>
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="mb-4"
      />
      <UButton
        v-if="session.loggedIn.value"
        :label="copy.navigation.dashboard"
        :to="dashboardPath"
        block
      />
      <div
        v-else
        class="grid grid-cols-2 gap-2"
      >
        <UButton
          :label="copy.navigation.login"
          color="neutral"
          variant="outline"
          block
          @click="login()"
        />
        <UButton
          :label="copy.navigation.start"
          block
          @click="login(undefined, 'register')"
        />
      </div>
    </template>
  </UHeader>
</template>
