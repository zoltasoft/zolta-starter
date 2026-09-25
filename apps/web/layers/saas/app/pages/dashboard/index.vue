<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: ['dashboard-auth'] })

const { t } = useI18n()
const session = useSaasIdentitySession()
const localePath = useLocalePath()

const name = computed(() => {
  const user = session.user.value as { name?: string, username?: string } | null
  return user?.name || user?.username || 'there'
})

const welcome = computed(() => t('dashboard.welcome', { name: name.value }))

useSeoMeta({
  title: () => `${t('dashboard.overview')} · ${t('dashboard.brand')}`,
  robots: 'noindex, nofollow'
})
</script>

<template>
  <UDashboardPanel id="saas-home">
    <template #header>
      <UDashboardNavbar>
        <template #title>
          <div class="flex items-center gap-2 font-semibold text-highlighted">
            <UIcon
              name="i-lucide-layout-dashboard"
              class="size-4 text-primary"
            />
            {{ t('dashboard.overview') }}
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UContainer class="flex min-h-[calc(100vh-8rem)] w-full items-center py-10">
        <div class="mx-auto w-full max-w-4xl">
          <UPageCard
            variant="subtle"
            class="overflow-hidden"
          >
            <div class="grid gap-8 lg:grid-cols-[1fr_220px] lg:items-center">
              <div>
                <p class="text-sm font-medium text-primary">
                  {{ t('dashboard.welcomeEyebrow') }}
                </p>
                <h1 class="mt-2 text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl">
                  {{ welcome }}
                </h1>
                <p class="mt-4 max-w-2xl text-base leading-7 text-muted">
                  {{ t('dashboard.description') }}
                </p>
                <UButton
                  :label="t('dashboard.settings')"
                  icon="i-lucide-settings"
                  :to="localePath('/dashboard/settings')"
                  class="mt-6"
                />
              </div>
              <div class="relative mx-auto grid size-44 place-items-center rounded-full border border-primary/20 bg-primary/5">
                <div class="absolute inset-5 rounded-full border border-primary/15" />
                <div class="absolute inset-10 rounded-full border border-primary/10" />
                <span class="grid size-14 place-items-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                  <UIcon
                    name="i-lucide-orbit"
                    class="size-7"
                  />
                </span>
              </div>
            </div>
          </UPageCard>

          <div class="mt-4 flex items-start gap-3 rounded-xl border border-default bg-elevated/50 p-4 text-sm leading-6 text-muted">
            <UIcon
              name="i-lucide-flask-conical"
              class="mt-1 size-4 shrink-0 text-primary"
            />
            <p>{{ t('dashboard.demoNote') }}</p>
          </div>
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
