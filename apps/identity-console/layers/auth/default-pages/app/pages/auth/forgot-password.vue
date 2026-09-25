<script setup lang="ts">
import * as z from 'zod/v4'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useIdentityMutation } from '../../../../app/composables/useIdentityMutation'

definePageMeta({
  layout: 'identity-auth',
  middleware: 'identity-live-auth'
})

const route = useRoute()
const toast = useToast()
const { t } = useI18n()
const { forgotPassword } = useIdentityAuth()
const mutateIdentity = useIdentityMutation()
const hostedApplication = computed(() => typeof route.query.application === 'string' ? route.query.application : '')
const schema = z.object({ email: z.email(t('auth.forgotPassword.validation.invalidEmail')) })
type ForgotPasswordSchema = z.output<typeof schema>
const fields = [{ name: 'email', type: 'email' as const, label: t('auth.forgotPassword.fields.email.label'), placeholder: t('auth.forgotPassword.fields.email.placeholder'), required: true, autocomplete: 'email' }]
const pending = ref(false)
const successMessage = ref('')

async function submit({ data }: FormSubmitEvent<ForgotPasswordSchema>) {
  pending.value = true
  successMessage.value = ''

  try {
    if (hostedApplication.value) {
      await mutateIdentity('/api/hosted-auth/password/forgot', {
        method: 'POST',
        body: { application: hostedApplication.value, email: data.email }
      })
    } else {
      await forgotPassword(data.email)
    }
    successMessage.value = t('auth.forgotPassword.sent.description', { email: data.email })
  } catch (error) {
    toast.add({
      title: t('auth.forgotPassword.toast.errorTitle'),
      description: identityAuthErrorMessage(
        error,
        t('auth.forgotPassword.toast.errorDescription')
      ),
      color: 'error'
    })
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UAuthForm
    class="identity-auth-form-shell"
    :fields="fields"
    :schema="schema"
    :validate-on="['input']"
    :title="t('auth.forgotPassword.form.title')"
    :description="t('auth.forgotPassword.form.description')"
    icon="i-lucide-key-round"
    :submit="{ label: t('auth.forgotPassword.form.submit'), loading: pending }"
    @submit="submit"
  >
    <template #header>
      <IdentityAuthFormHeader
        :title="t('auth.forgotPassword.form.title')"
        :description="t('auth.forgotPassword.form.description')"
      />
    </template>
    <template #validation>
      <p
        v-if="successMessage"
        class="identity-auth-success"
      >
        {{ successMessage }}
      </p>
    </template>
    <template #footer>
      <NuxtLink :to="{ ...identityAuthPagePath('login', route.params.pageSet, hostedApplication ? { application: hostedApplication, state: route.query.state } : {}) }">
        {{ t('auth.forgotPassword.form.returnToLogin') }}
      </NuxtLink>
    </template>
  </UAuthForm>
</template>
