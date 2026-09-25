<script setup lang="ts">
import * as z from 'zod/v4'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { IdentityAuthenticationContext } from '../../../../shared/types/identity-auth'
import { useIdentityMutation } from '../../../../app/composables/useIdentityMutation'

definePageMeta({
  layout: 'identity-auth',
  middleware: 'identity-live-auth'
})

const route = useRoute()
const config = useRuntimeConfig()
const toast = useToast()
const { t } = useI18n()
const auth = useIdentityAuth()
const mutateIdentity = useIdentityMutation()
const hostedApplication = computed(() =>
  typeof route.query.application === 'string' ? route.query.application : ''
)
const hostedState = computed(() =>
  typeof route.query.state === 'string' ? route.query.state : ''
)
const hosted = computed(() =>
  Boolean(hostedApplication.value && hostedState.value)
)
const loginSchema = z.object({
  email: z.email(t('auth.forgotPassword.validation.invalidEmail')),
  password: z.string(t('auth.login.validation.passwordRequired')).min(8, t('auth.login.validation.passwordMin'))
})
type LoginSchema = z.output<typeof loginSchema>
const pending = ref(false)
const demoPending = ref(false)
const demoReady = ref(false)
const googlePending = ref(false)

const {
  data: experience,
  error: experienceError,
  pending: experiencePending
} = await useFetch(
  () => (hosted.value ? '/api/hosted-auth/context' : '/api/auth/context'),
  {
    query: computed(() =>
      hosted.value
        ? {
            application: hostedApplication.value
          }
        : {}
    )
  }
)

const primary = computed(() => experience.value?.primary ?? null)
const liveEnabled = computed(() => primary.value?.project.mode === 'live')
const demoContext = computed<IdentityAuthenticationContext | null>(() => {
  if (!hosted.value && !config.public.identityAuth.sandboxEnabled) return null
  if (primary.value?.project.mode === 'sandbox') return primary.value
  if (experience.value?.sandbox?.project.mode === 'sandbox')
    return experience.value.sandbox
  return null
})
const registrationEnabled = computed(
  () =>
    liveEnabled.value && primary.value?.project.registration_mode === 'public'
)
const hostedAuthentication = computed(() => {
  const context = experience.value
  return context && 'application' in context
    ? context.application.authentication
    : undefined
})
const googleEnabled = computed(
  () => hosted.value && hostedAuthentication.value?.googleEnabled === true
)
const fields = computed(() => [
  {
    name: 'email',
    type: 'email' as const,
    label: t('auth.login.fields.email.label'),
    placeholder: t('auth.login.fields.email.placeholder'),
    required: true,
    autocomplete: 'email'
  },
  {
    name: 'password',
    type: 'password' as const,
    label: t('auth.login.fields.password.label'),
    placeholder: t('auth.login.fields.password.placeholder'),
    required: true,
    autocomplete: 'current-password'
  }
])
const providers = computed(() =>
  googleEnabled.value
    ? [
        {
          label: t('auth.login.form.google'),
          icon: 'i-simple-icons-google',
          loading: googlePending.value,
          disabled: Boolean(demoContext.value),
          onClick: continueWithGoogle
        }
      ]
    : []
)
const demoButtonLabel = computed(() => {
  if (demoReady.value) return t('auth.login.form.demoContinue')
  return demoPending.value ? t('auth.login.form.demoPreparing') : t('auth.login.form.demoCreate')
})

function destination(): string {
  return identitySafeRedirect(
    route.query.redirect,
    config.public.identityAuth.loginRedirect
  )
}

async function submit({ data }: FormSubmitEvent<LoginSchema>) {
  pending.value = true

  try {
    if (hosted.value) {
      const result = await mutateIdentity<{ redirectUrl: string }>(
        '/api/hosted-auth/login',
        {
          method: 'POST',
          body: {
            application: hostedApplication.value,
            state: hostedState.value,
            ...data
          }
        }
      )
      await navigateTo(result.redirectUrl, { external: true })
      return
    }

    await auth.login(data)
    await navigateTo(destination())
  } catch (error) {
    toast.add({
      title: t('auth.login.toast.error.title'),
      description: identityLoginErrorMessage(error),
      color: 'error'
    })
  } finally {
    pending.value = false
  }
}

async function provisionDemo() {
  if (demoPending.value || demoReady.value || !demoContext.value) return

  demoPending.value = true

  try {
    if (hosted.value) {
      const result = await mutateIdentity<{ redirectUrl: string }>(
        '/api/hosted-auth/sandbox',
        {
          method: 'POST',
          body: {
            application: hostedApplication.value,
            state: hostedState.value
          }
        }
      )
      await navigateTo(result.redirectUrl, { external: true })
      return
    }

    await auth.createSandboxSession(demoContext.value.connection)
    demoReady.value = true
  } catch (error) {
    toast.add({
      title: t('auth.login.demo.errorTitle'),
      description: identityAuthErrorMessage(
        error,
        t('auth.login.demo.errorDescription')
      ),
      color: 'error'
    })
  } finally {
    demoPending.value = false
  }
}

async function handleDemoAction() {
  if (demoReady.value) {
    await navigateTo(destination())
    return
  }

  await provisionDemo()
}

async function continueWithGoogle() {
  if (!hosted.value) return
  googlePending.value = true
  try {
    const result = await mutateIdentity<{ redirectUrl: string }>(
      '/api/hosted-auth/google',
      {
        method: 'POST',
        body: {
          application: hostedApplication.value,
          state: hostedState.value
        }
      }
    )
    await navigateTo(result.redirectUrl, { external: true })
  } catch (error) {
    toast.add({
      title: t('auth.login.toast.error.title'),
      description: identityAuthErrorMessage(
        error,
        t('auth.login.toast.error.description')
      ),
      color: 'error'
    })
  } finally {
    googlePending.value = false
  }
}
</script>

<template>
  <div class="identity-auth-page">
    <div
      v-if="experienceError"
      class="identity-auth-form-shell space-y-4"
    >
      <IdentityAuthFormHeader
        :title="t('login')"
        :description="t('auth.login.form.loadError')"
      />
      <p class="identity-auth-error">
        {{ t('auth.login.form.loadRetry') }}
      </p>
    </div>

    <div
      v-else-if="experiencePending"
      class="identity-auth-form-shell space-y-4"
    >
      <IdentityAuthFormHeader
        :title="t('login')"
        :description="t('auth.login.form.loadingSettings')"
      />
      <div class="identity-auth-status">
        {{ t('auth.login.form.loadingAuthentication') }}
      </div>
    </div>

    <template v-else>
      <UAuthForm
        v-if="liveEnabled"
        class="identity-auth-form-shell"
        :fields="fields"
        :schema="loginSchema"
        :validate-on="['input']"
        :providers="providers"
        :title="t('login')"
        :description="t('auth.login.form.description')"
        :submit="{ label: t('login'), loading: pending }"
        @submit="submit"
      >
        <template #header>
          <IdentityAuthFormHeader
            :title="t('login')"
          >
            <p class="identity-auth-form-header-link">
              <template v-if="registrationEnabled">
                {{ t('auth.login.form.newHere') }} <NuxtLink
                  :to="{
                    ...identityAuthPagePath('register', route.params.pageSet, hosted ? { application: hostedApplication, state: hostedState } : {})
                  }"
                  class="text-primary font-medium"
                >{{ t('auth.login.form.createAccount') }}</NuxtLink><span>.</span>
              </template>
              <template v-else>
                {{ t('auth.login.form.existingAccount') }}
              </template>
            </p>
          </IdentityAuthFormHeader>
        </template>
        <template #password-hint>
          <NuxtLink
            :to="{
              ...identityAuthPagePath('forgot-password', route.params.pageSet, hosted ? { application: hostedApplication, state: hostedState } : {})
            }"
            class="text-primary font-medium"
            tabindex="-1"
          >{{ t('auth.login.form.forgotPassword') }}</NuxtLink>
        </template>
        <template #footer>
          <div class="grid gap-3">
            <UButton
              v-if="demoContext"
              block
              color="neutral"
              variant="outline"
              :loading="demoPending"
              :label="demoButtonLabel"
              @click="handleDemoAction"
            />
          </div>
        </template>
      </UAuthForm>

      <div
        v-else-if="demoContext"
        class="identity-auth-form-shell grid gap-3"
      >
        <IdentityAuthFormHeader
          :title="t('auth.demo.title')"
          :description="t('auth.demo.description')"
        />
        <UButton
          block
          color="neutral"
          variant="outline"
          :loading="demoPending"
          :label="demoButtonLabel"
          @click="handleDemoAction"
        />
      </div>
    </template>
  </div>
</template>
