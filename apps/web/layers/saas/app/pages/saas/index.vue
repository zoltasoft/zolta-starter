<script setup lang="ts">
definePageMeta({
  layout: 'landing'
})
const { locale } = useI18n()
const localePath = useLocalePath()
const identity = useStarterIdentitySession()
const { data: page } = await useAsyncData(
  `index-${locale.value}`,
  () => queryCollection('index').where('path', '=', `/${locale.value}`).first(),
  {
    watch: [locale]
  }
)

const title = computed(() => page.value?.seo?.title || page.value?.title)
const description = computed(() => page.value?.seo?.description || page.value?.description)

function localizeTarget(target: string) {
  if (!target.startsWith('/') || target.startsWith('//')) {
    return target
  }

  const [path, hash] = target.split('#', 2)
  const localizedPath = localePath(path || '/saas')

  if (path === '/saas/auth/login') {
    return {
      to: identity.authorize(localePath('/saas/dashboard')),
      external: true
    }
  }

  if (path === '/saas/auth/signup') {
    return {
      to: identity.authorize(localePath('/saas/dashboard'), 'register'),
      external: true
    }
  }

  return `${localizedPath}${hash ? `#${hash}` : ''}`
}

function localizeLink(link: { to: string }) {
  const target = localizeTarget(link.to)
  return typeof target === 'string'
    ? { ...link, to: target }
    : { ...link, ...target }
}

const heroLinks = computed(() => page.value?.hero.links.map(localizeLink) || [])

const ctaLinks = computed(() => page.value?.cta.links.map(localizeLink) || [])

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogType: 'website',
  twitterCard: 'summary'
})
</script>

<template>
  <div v-if="page">
    <UPageHero
      :title="page.title"
      :description="page.description"
      :links="heroLinks"
    >
      <template #top>
        <SaasHeroBackground />
      </template>

      <template #title>
        <MDC
          :value="page.title"
          unwrap="p"
        />
      </template>
    </UPageHero>

    <UContainer class="relative z-10 -mt-8 max-w-6xl pb-12 sm:-mt-14 sm:pb-20">
      <SaasProductPreview variant="workspace" />
    </UContainer>

    <UPageSection
      v-for="(section, index) in page.sections"
      :key="index"
      :title="section.title"
      :description="section.description"
      :orientation="section.orientation"
      :reverse="section.reverse"
      :features="section.features"
    >
      <SaasProductPreview :variant="index === 0 ? 'workspace' : 'automation'" />
    </UPageSection>

    <UPageSection
      id="trust"
      :headline="page.trust.headline"
      :title="page.trust.title"
      :description="page.trust.description"
    >
      <UPageGrid>
        <UPageCard
          v-for="item in page.trust.items"
          :key="item.title"
          v-bind="item"
          variant="subtle"
        />
      </UPageGrid>

      <template #footer>
        <UButton
          :label="$t('saas.trust.privacyAction')"
          icon="i-lucide-shield-check"
          color="neutral"
          variant="outline"
          :to="localePath('/saas/privacy')"
        />
      </template>
    </UPageSection>

    <UPageSection
      id="faq"
      :headline="page.faq.headline"
      :title="page.faq.title"
      :description="page.faq.description"
    >
      <div class="mx-auto max-w-3xl divide-y divide-default overflow-hidden rounded-xl border border-default bg-default">
        <details
          v-for="item in page.faq.items"
          :key="item.title"
          class="group px-5 py-1 sm:px-6"
        >
          <summary class="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium text-highlighted marker:content-none">
            <span>{{ item.title }}</span>
            <UIcon
              name="i-lucide-plus"
              class="size-4 shrink-0 text-muted transition-transform group-open:rotate-45"
            />
          </summary>
          <p class="max-w-2xl pb-5 text-sm leading-6 text-muted">
            {{ item.description }}
          </p>
        </details>
      </div>
    </UPageSection>

    <UPageSection
      :title="page.features.title"
      :description="page.features.description"
    >
      <UPageGrid>
        <UPageCard
          v-for="(item, index) in page.features.items"
          :key="index"
          v-bind="item"
          spotlight
        />
      </UPageGrid>
    </UPageSection>

    <UPageSection
      v-if="page.testimonials.items.length"
      id="testimonials"
      :headline="page.testimonials.headline"
      :title="page.testimonials.title"
      :description="page.testimonials.description"
    >
      <UPageColumns class="xl:columns-4">
        <UPageCard
          v-for="(testimonial, index) in page.testimonials.items"
          :key="index"
          variant="subtle"
          :description="testimonial.quote"
          :ui="{
            description:
              'before:content-[open-quote] after:content-[close-quote]'
          }"
        >
          <template #footer>
            <UUser
              v-bind="testimonial.user"
              size="lg"
            />
          </template>
        </UPageCard>
      </UPageColumns>
    </UPageSection>

    <USeparator />

    <UPageCTA
      v-bind="page.cta"
      :links="ctaLinks"
      variant="naked"
      class="overflow-hidden"
    >
      <SaasStarsBg />
    </UPageCTA>
  </div>
</template>
