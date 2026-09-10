<script setup lang="ts">
definePageMeta({ layout: 'saas-dashboard', middleware: ['starter-auth'] })

const copy = useSaasTemplatePresentation()
const session = useStarterIdentitySession()
const isTemporaryAccount = computed(() => Boolean(session.user.value?.isTemporary))

const user = computed(() => {
  const value = session.user.value as {
    name?: string
    username?: string
    email?: string
    avatar?: string
  } | null

  const name = value?.name || value?.username || 'Demo user'

  return {
    name,
    description: value?.email || '',
    avatar: {
      src: value?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=2563eb&color=fff`,
      alt: name
    }
  }
})

useSeoMeta({
  title: () => `${copy.value.dashboard.settingsTitle} · ${copy.value.brand}`,
  robots: 'noindex, nofollow'
})
</script>

<template>
  <UDashboardPanel id="saas-settings">
    <template #header>
      <UDashboardNavbar>
        <template #title>
          <div class="flex items-center gap-2 font-semibold text-highlighted">
            <UIcon
              name="i-lucide-settings"
              class="size-4 text-primary"
            />
            {{ copy.dashboard.settings }}
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UContainer class="w-full py-10">
        <div class="mx-auto w-full max-w-4xl">
          <div>
            <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
              {{ copy.dashboard.settingsTitle }}
            </h1>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {{ copy.dashboard.settingsDescription }}
            </p>
          </div>

          <div class="mt-8 grid gap-5 lg:grid-cols-2">
            <UPageCard
              :title="copy.dashboard.account"
              :description="copy.dashboard.accountDescription"
              icon="i-lucide-user-round"
              variant="subtle"
            >
              <UUser
                v-bind="user"
                size="xl"
                class="mt-3"
              />

              <UButton
                v-if="!isTemporaryAccount"
                :label="copy.dashboard.manageAccount"
                icon="i-lucide-external-link"
                color="neutral"
                variant="soft"
                trailing
                class="mt-5"
                @click="session.openAccountPortal('profile')"
              />

              <UAlert
                v-else
                :description="copy.dashboard.temporaryAccountDescription"
                icon="i-lucide-flask-conical"
                color="warning"
                variant="subtle"
                class="mt-5"
              />
            </UPageCard>

            <UPageCard
              :title="copy.dashboard.preferences"
              :description="copy.dashboard.preferencesDescription"
              icon="i-lucide-sliders-horizontal"
              variant="subtle"
            >
              <div class="mt-4 flex flex-wrap items-center gap-2">
                <LanguageSwitcher />
                <UColorModeButton
                  color="neutral"
                  variant="outline"
                />
              </div>
            </UPageCard>
          </div>
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
