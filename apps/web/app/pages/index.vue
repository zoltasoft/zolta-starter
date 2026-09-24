<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()

const cards = computed(() => [
  {
    title: t('home.saasTitle'),
    description: t('home.saasDescription'),
    logo: '/branding/zoltasoft-saas.png',
    action: t('home.saasAction'),
    to: localePath('/saas'),
    theme: 'saas-theme'
  },
  {
    title: t('home.identityTitle'),
    description: t('home.identityDescription'),
    logo: '/branding/zoltasoft-identity.png',
    action: t('home.identityAction'),
    to: runtimeConfig.public.identityAuthUrl,
    external: true,
    theme: 'identity-theme'
  },
  {
    title: t('home.projectsTitle'),
    description: t('home.projectsDescription'),
    logo: '/branding/zoltasoft-tasks.png',
    action: t('home.projectsAction'),
    to: localePath('/projects'),
    theme: 'projects-theme'
  }
])
</script>

<template>
  <main class="min-h-screen bg-default">
    <UContainer class="flex min-h-screen flex-col">
      <header class="flex items-center justify-between border-b border-default py-5">
        <NuxtLink
          :to="localePath('/')"
          class="flex items-center gap-3"
        >
          <AppLogo
            logo="/branding/zoltasoft-starter.png"
            class="h-7 w-auto"
          />
        </NuxtLink>
        <div class="flex items-center gap-2">
          <LanguageSwitcher />
          <UColorModeButton />
        </div>
      </header>

      <section class="flex flex-1 items-center py-20">
        <div class="max-w-3xl">
          <p class="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-primary">
            {{ t('home.eyebrow') }}
          </p>
          <h1 class="text-4xl font-semibold tracking-tight text-highlighted sm:text-6xl">
            {{ t('home.title') }}
          </h1>
          <p class="mt-6 max-w-2xl text-lg leading-8 text-muted">
            {{ t('home.description') }}
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton
              :to="localePath('/auth/signup')"
              trailing-icon="i-lucide-arrow-right"
            >
              {{ t('home.getStarted') }}
            </UButton>
            <UButton
              to="https://zolta.dev"
              target="_blank"
              variant="outline"
            >
              {{ t('home.documentation') }}
            </UButton>
          </div>
        </div>
      </section>
      <UPageGrid class="pb-16">
        <UPageCard
          v-for="card in cards"
          :key="card.title"
          :title="card.title"
          :description="card.description"
          :class="['group transition hover:-translate-y-1', card.theme]"
          variant="subtle"
          spotlight
          spotlight-color="primary"
        >
          <template #leading>
            <div class="flex size-20 items-center justify-center sm:size-24">
              <img
                :src="card.logo"
                alt=""
                aria-hidden="true"
                class="size-full object-contain drop-shadow-xl transition duration-300 group-hover:scale-105"
              >
            </div>
          </template>
          <template #footer>
            <UButton
              :to="card.to"
              :external="card.external"
              trailing-icon="i-lucide-arrow-right"
            >
              {{ card.action }}
            </UButton>
          </template>
        </UPageCard>
      </UPageGrid>
    </UContainer>
  </main>
</template>
