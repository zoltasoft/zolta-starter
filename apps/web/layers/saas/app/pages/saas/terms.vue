<script setup lang="ts">
definePageMeta({ layout: 'landing' })
const copy = useSaasTemplatePresentation()
useSeoMeta({ title: () => `${copy.value.legal.termsTitle} · ${copy.value.brand}` })
</script>

<template>
  <UContainer class="max-w-4xl py-16 sm:py-24">
    <p class="text-sm font-medium text-primary">
      {{ copy.legal.updated }}
    </p>
    <h1 class="mt-3 text-4xl font-semibold tracking-tight text-highlighted sm:text-5xl">
      {{ copy.legal.termsTitle }}
    </h1>
    <UAlert
      color="warning"
      variant="subtle"
      icon="i-lucide-info"
      :description="copy.legal.notice"
      class="mt-8"
    />
    <div class="mt-12 space-y-10">
      <section
        v-for="section in copy.legal.terms"
        :key="section.title"
      >
        <h2 class="text-xl font-semibold text-highlighted">
          {{ section.title }}
        </h2>
        <p class="mt-3 leading-7 text-muted">
          {{ section.body }}
        </p>
      </section>
    </div>
  </UContainer>
</template>
