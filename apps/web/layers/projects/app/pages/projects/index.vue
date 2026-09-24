<script setup lang="ts">
definePageMeta({
  layout: 'projects-landing'
})

const copy = useProjectsHomePresentation()
const localePath = useLocalePath()
const session = useProjectsIdentitySession()

const heroLinks = computed(() => [
  {
    label: session.loggedIn.value ? copy.value.navigation.dashboard : copy.value.hero.start,
    to: session.loggedIn.value ? localePath('/projects/dashboard') : session.authorize(localePath('/projects/dashboard')),
    external: !session.loggedIn.value,
    trailingIcon: 'i-lucide-arrow-right'
  },
  {
    label: copy.value.hero.seeTasks,
    to: localePath('/projects/dashboard/tasks'),
    color: 'neutral' as const,
    variant: 'subtle' as const
  }
])

const ctaLinks = computed(() => [
  {
    label: copy.value.cta.open,
    to: localePath('/projects/dashboard'),
    trailingIcon: 'i-lucide-arrow-right'
  },
  {
    label: copy.value.cta.tasks,
    to: localePath('/projects/dashboard/tasks'),
    variant: 'subtle' as const,
    icon: 'i-lucide-list-checks'
  }
])

useSeoMeta({
  title: () => copy.value.hero.title,
  description: () => copy.value.hero.description,
  ogTitle: () => copy.value.hero.title,
  ogDescription: () => copy.value.hero.description,
  ogType: 'website',
  twitterCard: 'summary'
})
</script>

<template>
  <div>
    <UPageHero
      :title="copy.hero.title"
      :description="copy.hero.description"
      :links="heroLinks"
    />

    <UPageSection
      id="features"
      :title="copy.features.title"
      :description="copy.features.description"
      class="-mt-8 sm:-mt-12"
    >
      <UPageGrid>
        <UPageCard
          v-for="item in copy.features.items"
          :key="item.title"
          v-bind="item"
          spotlight
        />
      </UPageGrid>
    </UPageSection>

    <USeparator />

    <UPageCTA
      :title="copy.cta.title"
      :description="copy.cta.description"
      :links="ctaLinks"
      variant="naked"
      class="overflow-hidden"
    />
  </div>
</template>
