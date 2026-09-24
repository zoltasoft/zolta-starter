<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: ['dashboard-auth'] })

const { t } = useI18n()
const session = useIdentitySession()
const identityAccount = useZoltaIdentity('starter')
const isTemporaryAccount = computed(() => Boolean(session.user.value?.isTemporary))

const user = computed(() => {
  const account = session.user.value
  const name = account?.name || account?.username || t('userMenu.authenticatedUser')

  return {
    name,
    description: account?.email || '',
    avatar: {
      src: account?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0D8ABC&color=fff`,
      alt: name
    }
  }
})

useSeoMeta({
  title: () => `${t('dashboard.settingsTitle')} · ${t('dashboard.brand')}`,
  robots: 'noindex, nofollow'
})
</script>

<template>
  <UContainer class="w-full py-8 sm:py-10">
    <div class="mx-auto w-full max-w-4xl space-y-6">
      <header>
        <h1 class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
          {{ t('dashboard.settingsTitle') }}
        </h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-muted">
          {{ t('dashboard.settingsDescription') }}
        </p>
      </header>

      <UPageCard
        :title="t('dashboard.account')"
        :description="t('dashboard.accountDescription')"
        icon="i-lucide-shield-user"
        variant="subtle"
      >
        <div class="flex flex-col gap-5 p-1 sm:flex-row sm:items-center sm:justify-between">
          <UUser
            v-bind="user"
            size="xl"
          />

          <UBadge
            v-if="isTemporaryAccount"
            :label="t('dashboard.temporaryDemo')"
            icon="i-lucide-flask-conical"
            color="warning"
            variant="soft"
            class="self-start sm:self-center"
          />
          <UButton
            v-else
            :label="t('dashboard.manageAccount')"
            icon="i-lucide-external-link"
            color="neutral"
            variant="soft"
            trailing
            class="self-start sm:self-center"
            @click="identityAccount.openAccountPortal('profile')"
          />
        </div>

        <UAlert
          v-if="isTemporaryAccount"
          :title="t('dashboard.accountManagementUnavailableTitle')"
          :description="t('dashboard.accountManagementUnavailableDescription')"
          icon="i-lucide-shield-alert"
          color="warning"
          variant="subtle"
          class="mt-4"
        />
      </UPageCard>
    </div>
  </UContainer>
</template>
