<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const localePath = useLocalePath()
const { session, login } = useAuthenticationState()
const items = computed<NavigationMenuItem[]>(() => [
  { label: 'Product', to: localePath('/saas') },
  { label: 'Dashboard', to: localePath('/saas/dashboard') }
])
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink :to="localePath('/saas')">
        <AppLogo brand="Zolta Starter" />
      </NuxtLink>
    </template>
    <UNavigationMenu
      :items="items"
      class="hidden lg:flex"
    />
    <template #right>
      <UserMenu
        v-if="session.loggedIn.value"
        class="max-w-fit"
      />
      <UButton
        v-else
        label="Sign in"
        @click="login()"
      />
    </template>
    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="mb-4"
      />
    </template>
  </UHeader>
</template>
