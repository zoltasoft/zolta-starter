<script setup lang="ts">
const localePath = useLocalePath()
const columns = [[
  {
    label: 'Zolta Starter',
    children: [
      { label: 'Product', to: localePath('/saas') },
      { label: 'Dashboard', to: localePath('/saas/dashboard') },
      { label: 'Terms', to: localePath('/saas/terms') },
      { label: 'Privacy', to: localePath('/saas/privacy') }
    ]
  }
]]
</script>

<template>
  <UFooter :ui="{ top: 'border-b border-default' }">
    <template #top>
      <UContainer>
        <UFooterColumns :columns="columns">
          <template #right>
            <p class="max-w-sm text-sm leading-6 text-muted">
              A reusable SaaS and dashboard foundation for Zolta Identity.
            </p>
          </template>
        </UFooterColumns>
      </UContainer>
    </template>
    <template #left>
      <p class="text-sm text-muted">
        Zolta Starter &copy; {{ new Date().getFullYear() }}
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
