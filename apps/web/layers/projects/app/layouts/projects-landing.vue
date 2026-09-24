<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const copy = useProjectsHomePresentation()
const localePath = useLocalePath()
const route = useRoute()
const session = useProjectsIdentitySession()

await session.fetch()

const dashboardPath = computed(() => localePath('/projects/dashboard'))
const loginUrl = computed(() => session.authorize(dashboardPath.value))
const signupUrl = computed(() => session.authorize(dashboardPath.value, 'register'))
const items = computed<NavigationMenuItem[]>(() => [
  { label: copy.value.navigation.product, to: `${localePath('/projects')}#features`, active: route.hash === '#features' },
  { label: copy.value.navigation.tasks, to: localePath('/projects/dashboard/tasks') }
])
</script>

<template>
  <div class="projects-theme min-h-screen">
    <UHeader :ui="{ container: 'max-w-7xl' }">
      <template #left>
        <NuxtLink
          :to="localePath('/projects')"
          class="rounded-lg focus-visible:outline-2 focus-visible:outline-primary"
        >
          <AppLogo
            :brand="copy.brand"
            icon="i-lucide-kanban-square"
            logo="/branding/zoltasoft-tasks.png"
          />
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
            :href="loginUrl"
            external
            color="neutral"
            variant="ghost"
            class="hidden sm:inline-flex"
          />
          <UButton
            :label="copy.navigation.start"
            :href="signupUrl"
            external
            trailing-icon="i-lucide-arrow-right"
            class="hidden sm:inline-flex"
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
            :href="loginUrl"
            external
            color="neutral"
            variant="outline"
            block
          />
          <UButton
            :label="copy.navigation.start"
            :href="signupUrl"
            external
            block
          />
        </div>
      </template>
    </UHeader>

    <UMain>
      <slot />
    </UMain>

    <UFooter :ui="{ top: 'border-b border-default' }">
      <template #top>
        <UContainer class="max-w-7xl">
          <UFooterColumns
            :columns="[
              {
                label: copy.footer.product,
                children: [
                  { label: copy.footer.features, to: `${localePath('/projects')}#features` },
                  { label: copy.navigation.tasks, to: localePath('/projects/dashboard/tasks') }
                ]
              },
              {
                label: copy.footer.resources,
                children: [
                  { label: copy.footer.documentation, to: localePath('/') },
                  { label: copy.footer.support, to: `${localePath('/projects')}#features` }
                ]
              }
            ]"
          >
            <template #right>
              <div class="max-w-sm">
                <AppLogo
                  :brand="copy.brand"
                  icon="i-lucide-kanban-square"
                  logo="/branding/zoltasoft-tasks.png"
                />
                <p class="mt-4 text-sm leading-6 text-muted">
                  {{ copy.footer.description }}
                </p>
              </div>
            </template>
          </UFooterColumns>
        </UContainer>
      </template>
      <template #left>
        <p class="text-sm text-muted">
          {{ copy.brand }} &copy; {{ new Date().getFullYear() }}
        </p>
      </template>
      <template #right>
        <LanguageSwitcher />
        <UColorModeButton
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </div>
</template>
