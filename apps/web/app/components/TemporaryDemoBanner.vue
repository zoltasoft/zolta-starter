<script setup lang="ts">
import type { IdentityAuthenticatedUser } from '../../shared/types/identity-authenticated-user'

const { t } = useI18n()
const { user } = useIdentitySession()
const now = useNow({ interval: 1000 })

const demoUser = computed(() => user.value as IdentityAuthenticatedUser | null)
const visible = computed(() => Boolean(demoUser.value?.isTemporary && demoUser.value.expiresAt))
const expanded = useState('temporary-demo-notice:expanded', () => true)
const remaining = computed(() => {
  const expiresAt = demoUser.value?.expiresAt
  if (!expiresAt) return 0
  return Math.max(0, Math.ceil((Date.parse(expiresAt) - now.value.getTime()) / 1000))
})
const remainingLabel = computed(() => {
  const minutes = Math.floor(remaining.value / 60)
  const seconds = remaining.value % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
})

watch(visible, (isVisible, wasVisible) => {
  if (isVisible && !wasVisible) expanded.value = true
})
</script>

<template>
  <div
    v-if="visible"
    class="fixed bottom-4 right-4 z-50"
  >
    <Transition name="temporary-demo-notice">
      <UAlert
        v-if="expanded"
        class="mb-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-primary-400/40 shadow-xl"
        color="primary"
        variant="solid"
        :title="t('auth.demoSession.title')"
        :description="t('auth.demoSession.description', { time: remainingLabel })"
      >
        <template #leading>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            :aria-label="t('auth.demoSession.hide')"
            :title="t('auth.demoSession.hide')"
            class="rounded-full text-inverted hover:bg-white/15 hover:text-inverted"
            @click="expanded = false"
          />
        </template>
      </UAlert>
    </Transition>
    <UButton
      v-if="!expanded"
      color="primary"
      icon="i-lucide-flask-conical"
      :aria-label="t('auth.demoSession.show')"
      :title="t('auth.demoSession.show')"
      class="rounded-full shadow-lg"
      @click="expanded = true"
    />
  </div>
</template>

<style scoped>
.temporary-demo-notice-enter-active,
.temporary-demo-notice-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.temporary-demo-notice-enter-from,
.temporary-demo-notice-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}
</style>
