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
const { resetPassword } = useIdentityAuth()
const mutateIdentity = useIdentityMutation()
const hostedClientId = computed(() => typeof route.query.client_id === 'string' ? route.query.client_id : '')
const schema = z.object({
  email: z.email(t('auth.forgotPassword.validation.invalidEmail')),
  token: z.string(t('auth.resetPassword.validation.tokenRequired')).min(64, t('auth.resetPassword.validation.tokenRequired')),
  password: z.string(t('auth.resetPassword.validation.passwordRequired')).min(12, t('auth.resetPassword.validation.passwordMin')),
  passwordConfirmation: z.string(t('auth.resetPassword.validation.confirmationRequired')).min(12, t('auth.resetPassword.validation.passwordMin'))
}).refine(data => data.password === data.passwordConfirmation, {
  message: t('auth.resetPassword.validation.passwordMatch'),
  path: ['passwordConfirmation']
})
type ResetPasswordSchema = z.output<typeof schema>
const fields = [
  { name: 'email', type: 'email' as const, label: t('auth.forgotPassword.fields.email.label'), placeholder: t('auth.forgotPassword.fields.email.placeholder'), required: true, autocomplete: 'email', defaultValue: typeof route.query.email === 'string' ? route.query.email : '' },
  { name: 'token', type: 'text' as const, label: t('auth.resetPassword.fields.token.label'), placeholder: t('auth.resetPassword.fields.token.placeholder'), required: true, autocomplete: 'one-time-code', defaultValue: typeof route.query.token === 'string' ? route.query.token : '' },
  { name: 'password', type: 'password' as const, label: t('auth.resetPassword.fields.password.label'), placeholder: t('auth.resetPassword.fields.password.placeholder'), required: true, autocomplete: 'new-password' },
  { name: 'passwordConfirmation', type: 'password' as const, label: t('auth.resetPassword.fields.confirmation.label'), placeholder: t('auth.resetPassword.fields.confirmation.placeholder'), required: true, autocomplete: 'new-password' }
]
const pending = ref(false)
const successMessage = ref('')
const applicationUrl = ref('')

async function submit({ data }: FormSubmitEvent<ResetPasswordSchema>) {
  pending.value = true
  successMessage.value = ''

  try {
    if (hostedClientId.value) {
      const result = await mutateIdentity<{ applicationUrl: string }>('/api/hosted-auth/password/reset', {
        method: 'POST',
        body: { clientId: hostedClientId.value, ...data }
      })
      applicationUrl.value = result.applicationUrl
    } else {
      await resetPassword(data)
    }
    successMessage.value = t('auth.resetPassword.complete.description')
  } catch (error) {
    toast.add({
      title: t('auth.resetPassword.toast.errorTitle'),
      description: identityAuthErrorMessage(
        error,
        t('auth.resetPassword.toast.errorDescription')
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
    :title="t('auth.resetPassword.form.title')"
    :description="t('auth.resetPassword.form.pageDescription')"
    icon="i-lucide-lock-keyhole"
    :submit="{ label: t('auth.resetPassword.form.submit'), loading: pending }"
    @submit="submit"
  >
    <template #header>
      <IdentityAuthFormHeader
        :title="t('auth.resetPassword.form.title')"
        :description="t('auth.resetPassword.form.pageDescription')"
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
      <a
        v-if="applicationUrl"
        :href="applicationUrl"
      >
        {{ t('auth.resetPassword.form.returnApplication') }}
      </a>
      <NuxtLink
        v-else
        :to="identityAuthPagePath('login', route.params.pageSet)"
      >
        {{ t('auth.resetPassword.form.continueSignIn') }}
      </NuxtLink>
    </template>
  </UAuthForm>
</template>
