<script setup lang="ts">
const copy = useSaasTemplatePresentation()
const localePath = useLocalePath()

const columns = computed(() => [
  {
    label: copy.value.footer.product,
    children: [
      { label: copy.value.footer.features, to: `${localePath('/saas')}#features` },
      { label: copy.value.navigation.pricing, to: localePath('/saas/pricing') }
    ]
  },
  {
    label: copy.value.footer.resources,
    children: [
      { label: copy.value.navigation.changelog, to: localePath('/saas/changelog') },
      { label: copy.value.footer.support, to: `${localePath('/saas')}#faq` }
    ]
  },
  {
    label: copy.value.footer.legal,
    children: [
      { label: copy.value.footer.terms, to: localePath('/saas/terms') },
      { label: copy.value.footer.privacy, to: localePath('/saas/privacy') }
    ]
  }
])
</script>

<template>
  <UFooter :ui="{ top: 'border-b border-default' }">
    <template #top>
      <UContainer class="max-w-7xl">
        <UFooterColumns :columns="columns">
          <template #right>
            <div class="max-w-sm">
              <SaasBrand />
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
        Zoltasoft SaaS &copy; {{ new Date().getFullYear() }}
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
</template>
