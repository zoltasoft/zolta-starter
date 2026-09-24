<script setup lang="ts">
definePageMeta({ layout: 'landing' })

const copy = useSaasTemplatePresentation()
const localePath = useLocalePath()
const session = useStarterIdentitySession()
const signupTo = computed(() => session.authorize(localePath('/dashboard'), 'register'))

useSeoMeta({
  title: () => `${copy.value.navigation.changelog} · ${copy.value.brand}`,
  description: () => copy.value.changelog.description
})
</script>

<template>
  <div>
    <UPageHero
      :headline="copy.changelog.eyebrow"
      :title="copy.changelog.title"
      :description="copy.changelog.description"
    />

    <UContainer class="max-w-4xl pb-24">
      <div class="relative space-y-10 before:absolute before:bottom-5 before:left-[1.15rem] before:top-5 before:w-px before:bg-default sm:before:left-[8.5rem]">
        <article
          v-for="entry in copy.changelog.entries"
          :key="entry.version"
          class="relative grid gap-4 pl-12 sm:grid-cols-[7rem_1fr] sm:gap-8 sm:pl-0"
        >
          <div class="text-sm text-muted">
            <p>{{ entry.date }}</p>
            <UBadge
              :label="`v${entry.version}`"
              color="neutral"
              variant="subtle"
              class="mt-2"
            />
          </div>
          <span class="absolute left-3.5 top-1.5 size-4 rounded-full border-4 border-default bg-primary sm:left-[8rem]" />
          <UPageCard variant="subtle">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <h2 class="text-xl font-semibold text-highlighted">
                {{ entry.title }}
              </h2>
              <div class="flex flex-wrap gap-1.5">
                <UBadge
                  v-for="tag in entry.tags"
                  :key="tag"
                  :label="tag"
                  color="neutral"
                  variant="outline"
                  size="sm"
                />
              </div>
            </div>
            <p class="mt-3 leading-7 text-muted">
              {{ entry.description }}
            </p>
          </UPageCard>
        </article>
      </div>

      <div class="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center sm:p-9">
        <h2 class="text-2xl font-semibold tracking-tight text-highlighted">
          {{ copy.dashboard.description }}
        </h2>
        <UButton
          :label="copy.navigation.start"
          :href="signupTo"
          trailing-icon="i-lucide-arrow-right"
          class="mt-5"
        />
      </div>
    </UContainer>
  </div>
</template>
