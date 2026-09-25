<script setup lang="ts">
import * as z from 'zod/v4'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { IdentityAuthenticationExperience } from '../../../../shared/types/identity-auth'
import { useIdentityMutation } from '../../../../app/composables/useIdentityMutation'

definePageMeta({
  layout: 'identity-auth',
  middleware: 'identity-live-auth'
})

type ProfileStep = {
  username: string
  email: string
}

type PasswordStep = {
  password: string
  passwordConfirmation: string
}

const config = useRuntimeConfig()
const route = useRoute()
const toast = useToast()
const { t } = useI18n()
const { register } = useIdentityAuth()
const mutateIdentity = useIdentityMutation()
const hostedApplication = computed(() => typeof route.query.application === 'string' ? route.query.application : '')
const hostedState = computed(() => typeof route.query.state === 'string' ? route.query.state : '')
const hosted = computed(() => Boolean(hostedApplication.value && hostedState.value))
const pending = ref(false)
const step = ref<'profile' | 'password'>('profile')
const registration = reactive<ProfileStep & PasswordStep>({
  username: '',
  email: '',
  password: '',
  passwordConfirmation: ''
})
const consentOpen = ref(false)
const consentAccepted = ref(false)
const { data: experience } = await useFetch<IdentityAuthenticationExperience & { application?: { authentication?: { termsRequired?: boolean, termsUrl?: string | null, privacyUrl?: string | null } } }>(
  () => hosted.value ? '/api/hosted-auth/context' : '',
  { query: computed(() => hosted.value ? { application: hostedApplication.value } : {}), immediate: hosted }
)
const hostedAuthentication = computed(() => experience.value?.application?.authentication)
const termsRequired = computed(() => hostedAuthentication.value?.termsRequired ?? false)
const googleEnabled = computed(() => hosted.value && hostedAuthentication.value?.googleEnabled === true)
const googlePending = ref(false)
const profileSchema = z.object({
  username: z.string(t('auth.signup.validation.nameRequired')).trim().min(2, t('auth.signup.validation.nameRequired')).max(100),
  email: z.email(t('auth.forgotPassword.validation.invalidEmail'))
})
const passwordSchema = z.object({
  password: z.string(t('auth.signup.validation.passwordRequired')).min(12, t('auth.signup.validation.passwordMin')),
  passwordConfirmation: z.string(t('auth.signup.validation.passwordConfirmationRequired')).min(12, t('auth.signup.validation.passwordMin'))
}).refine(data => data.password === data.passwordConfirmation, {
  message: t('auth.signup.validation.passwordConfirmationMismatch'),
  path: ['passwordConfirmation']
})
const profileFields = computed(() => [
  { name: 'username', type: 'text' as const, label: t('auth.signup.fields.name.label'), placeholder: t('auth.signup.fields.name.placeholder'), required: true, autocomplete: 'name', defaultValue: registration.username },
  { name: 'email', type: 'email' as const, label: t('auth.signup.fields.email.label'), placeholder: t('auth.signup.fields.email.placeholder'), required: true, autocomplete: 'email', defaultValue: registration.email }
])
const passwordFields = computed(() => [
  { name: 'password', type: 'password' as const, label: t('auth.signup.fields.password.label'), placeholder: t('auth.signup.fields.password.placeholder'), required: true, autocomplete: 'new-password', defaultValue: registration.password },
  { name: 'passwordConfirmation', type: 'password' as const, label: t('auth.signup.fields.password.label'), placeholder: t('auth.signup.validation.passwordConfirmationRequired'), required: true, autocomplete: 'new-password', defaultValue: registration.passwordConfirmation }
])
const providers = computed(() => googleEnabled.value
  ? [{
      label: t('auth.signup.form.google'),
      icon: 'i-simple-icons-google',
      loading: googlePending.value,
      disabled: Boolean(experience.value?.sandbox),
      onClick: continueWithGoogle
    }]
  : [])

function continueToPassword({ data }: FormSubmitEvent<ProfileStep>) {
  registration.username = data.username
  registration.email = data.email
  step.value = 'password'
}

function returnToProfile() {
  step.value = 'profile'
}

async function requestAccountCreation({ data }: FormSubmitEvent<PasswordStep>) {
  registration.password = data.password
  registration.passwordConfirmation = data.passwordConfirmation
  if (termsRequired.value) {
    consentAccepted.value = false
    consentOpen.value = true
    return
  }

  await createAccount(false)
}

async function acceptConsent() {
  if (!consentAccepted.value) return
  consentOpen.value = false
  await createAccount(true)
}

async function createAccount(termsAccepted: boolean) {
  pending.value = true

  try {
    const data = { ...registration, termsAccepted }
    if (hosted.value) {
      const result = await mutateIdentity<{ redirectUrl?: string }>('/api/hosted-auth/register', {
        method: 'POST',
        body: {
          application: hostedApplication.value,
          state: hostedState.value,
          ...data
        }
      })
      if (result.redirectUrl) {
        await navigateTo(result.redirectUrl, { external: true })
        return
      }
      await navigateTo(identityAuthPagePath('verify-email', route.params.pageSet, { application: hostedApplication.value, state: hostedState.value }))
      return
    }

    await register(data)
    await navigateTo(identitySafeRedirect(
      config.public.identityAuth.registerRedirect,
      '/auth/verify-email'
    ))
  } catch (error) {
    toast.add({
      title: t('auth.signup.toast.error.title'),
      description: identityAuthErrorMessage(error, t('auth.signup.toast.error.description')),
      color: 'error'
    })
  } finally {
    pending.value = false
  }
}

async function continueWithGoogle() {
  if (!hosted.value) return
  googlePending.value = true
  try {
    const result = await mutateIdentity<{ redirectUrl: string }>('/api/hosted-auth/google', {
      method: 'POST',
      body: { application: hostedApplication.value, state: hostedState.value }
    })
    await navigateTo(result.redirectUrl, { external: true })
  } catch (error) {
    toast.add({
      title: t('auth.signup.toast.error.title'),
      description: identityAuthErrorMessage(error, t('auth.signup.toast.error.description')),
      color: 'error'
    })
  } finally {
    googlePending.value = false
  }
}
</script>

<template>
  <div class="identity-auth-page">
    <Transition
      name="identity-auth-step"
      mode="out-in"
    >
      <UAuthForm
        v-if="step === 'profile'"
        key="profile"
        class="identity-auth-form-shell"
        :fields="profileFields"
        :schema="profileSchema"
        :validate-on="['input']"
        :providers="providers"
        :title="t('auth.signup.form.title')"
        :description="t('auth.signup.form.description')"
        icon="i-lucide-user-round-plus"
        :submit="{ label: t('auth.signup.form.continue') }"
        @submit="continueToPassword"
      >
        <template #header>
          <IdentityAuthFormHeader
            :title="t('auth.signup.form.title')"
          >
            <p class="identity-auth-form-header-link">
              {{ t('auth.signup.form.haveAccount') }} <NuxtLink
                :to="identityAuthPagePath('login', route.params.pageSet, hosted ? { application: hostedApplication, state: hostedState } : {})"
                class="text-primary font-medium"
              >{{ t('login') }}</NuxtLink><span>.</span>
            </p>
          </IdentityAuthFormHeader>
        </template>
      </UAuthForm>

      <UAuthForm
        v-else
        key="password"
        class="identity-auth-form-shell"
        :fields="passwordFields"
        :schema="passwordSchema"
        :validate-on="['input']"
        :title="t('auth.signup.form.secureTitle')"
        :description="t('auth.signup.form.secureDescription')"
        icon="i-lucide-lock-keyhole"
        :submit="{ label: t('auth.signup.form.submit'), loading: pending }"
        @submit="requestAccountCreation"
      >
        <template #header>
          <IdentityAuthFormHeader
            :title="t('auth.signup.form.secureTitle')"
            :description="t('auth.signup.form.secureDescription')"
          />
        </template>
        <template #footer>
          <button
            type="button"
            class="text-primary font-medium"
            :disabled="pending"
            @click="returnToProfile"
          >
            {{ t('auth.signup.form.backToProfile') }}
          </button>
        </template>
      </UAuthForm>
    </Transition>

    <UModal
      v-model:open="consentOpen"
      :title="t('auth.signup.form.termsReviewTitle')"
      :description="t('auth.signup.form.termsReviewDescription')"
    >
      <template #body>
        <div class="space-y-5">
          <p class="text-sm text-muted">
            {{ t('auth.signup.form.termsPrompt') }}
            <a
              v-if="hostedAuthentication?.termsUrl"
              :href="hostedAuthentication.termsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary font-medium"
            >{{ t('auth.signup.form.terms') }}</a><template v-if="hostedAuthentication?.termsUrl && hostedAuthentication?.privacyUrl">
              {{ t('auth.signup.form.and') }}
            </template><a
              v-if="hostedAuthentication?.privacyUrl"
              :href="hostedAuthentication.privacyUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary font-medium"
            >{{ t('auth.signup.form.privacy') }}</a>.
          </p>
          <UCheckbox
            v-model="consentAccepted"
            :label="t('auth.signup.form.termsLabel')"
          />
          <div class="flex justify-end gap-2">
            <UButton
              :label="t('auth.signup.form.cancel')"
              color="neutral"
              variant="ghost"
              @click="consentOpen = false"
            />
            <UButton
              :label="t('auth.signup.form.accept')"
              :disabled="!consentAccepted"
              :loading="pending"
              @click="acceptConsent"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
