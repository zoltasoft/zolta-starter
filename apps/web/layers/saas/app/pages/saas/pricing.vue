<script setup lang="ts">
definePageMeta({ layout: 'landing' })

const copy = useSaasTemplatePresentation()
const localePath = useLocalePath()
const session = useSaasIdentitySession()
const yearly = ref(true)
const signupTo = computed(() => session.authorize(localePath('/dashboard'), 'register'))

useSeoMeta({
  title: () => `${copy.value.navigation.pricing} · ${copy.value.brand}`,
  description: () => copy.value.pricing.description
})
</script>

<template>
  <div>
    <UPageHero
      :headline="copy.pricing.eyebrow"
      :title="copy.pricing.title"
      :description="copy.pricing.description"
    >
      <template #links>
        <div class="inline-flex rounded-full border border-default bg-elevated p-1 shadow-sm">
          <UButton
            :label="copy.pricing.monthly"
            :color="yearly ? 'neutral' : 'primary'"
            :variant="yearly ? 'ghost' : 'solid'"
            size="sm"
            @click="yearly = false"
          />
          <UButton
            :label="`${copy.pricing.yearly} · ${copy.pricing.yearlySaving}`"
            :color="yearly ? 'primary' : 'neutral'"
            :variant="yearly ? 'solid' : 'ghost'"
            size="sm"
            @click="yearly = true"
          />
        </div>
      </template>
    </UPageHero>

    <UContainer class="max-w-7xl pb-20">
      <div class="grid gap-5 lg:grid-cols-3">
        <UPageCard
          v-for="plan in copy.pricing.plans"
          :key="plan.name"
          :class="'popular' in plan && plan.popular ? 'ring-2 ring-primary' : ''"
          class="relative"
        >
          <UBadge
            v-if="'popular' in plan && plan.popular"
            :label="copy.pricing.popular"
            class="absolute right-5 top-5"
          />
          <div>
            <h2 class="text-xl font-semibold text-highlighted">
              {{ plan.name }}
            </h2>
            <p class="mt-2 min-h-12 text-sm leading-6 text-muted">
              {{ plan.description }}
            </p>
          </div>

          <div class="mt-7 flex items-end gap-1">
            <span
              v-if="(yearly ? plan.yearly : plan.monthly) === 0"
              class="text-4xl font-semibold tracking-tight text-highlighted"
            >
              {{ copy.pricing.free }}
            </span>
            <template v-else>
              <span class="pb-1 text-lg text-muted">{{ copy.pricing.currency }}</span>
              <span class="text-4xl font-semibold tracking-tight text-highlighted">{{ yearly ? plan.yearly : plan.monthly }}</span>
              <span class="pb-1 text-sm text-muted">{{ copy.pricing.perMonth }}</span>
            </template>
          </div>
          <p class="mt-1 h-5 text-xs text-muted">
            {{ yearly && plan.yearly > 0 ? copy.pricing.billedYearly : '' }}
          </p>

          <UButton
            :label="copy.pricing.action"
            :href="signupTo"
            :color="'popular' in plan && plan.popular ? 'primary' : 'neutral'"
            :variant="'popular' in plan && plan.popular ? 'solid' : 'outline'"
            block
            class="mt-6"
          />

          <ul class="mt-7 space-y-3">
            <li
              v-for="feature in plan.features"
              :key="feature"
              class="flex items-start gap-2 text-sm text-toned"
            >
              <UIcon
                name="i-lucide-circle-check"
                class="mt-0.5 size-4 shrink-0 text-primary"
              />
              <span>{{ feature }}</span>
            </li>
          </ul>
        </UPageCard>
      </div>
    </UContainer>

    <UPageSection :title="copy.pricing.faqTitle">
      <UAccordion
        :items="copy.pricing.faq"
        class="mx-auto max-w-3xl"
      />
    </UPageSection>
  </div>
</template>
