export default defineNuxtConfig({
  extends: [
    './layers/saas',
    './layers/dashboard',
    './packages/i18n',
    './packages/nuxt-content',
    './packages/ui'
  ],
  icon: { clientBundle: { icons: ['lucide:orbit', 'lucide:sparkles', 'lucide:house'] } },
  modules: [
    '@nuxt/eslint',
    '@vueuse/nuxt',
    'nuxt-auth-utils',
    'nuxt-csurf',
    '@zoltasoft/identity-consumer-nuxt'
  ],
  runtimeConfig: {
    public: {
      siteUrl: process.env.ZOLTA_STARTER_SITE_URL ?? 'http://localhost:3000'
    },
    zoltaIdentity: {
      sessionSecret: process.env.NUXT_ZOLTA_IDENTITY_SESSION_SECRET ?? '',
      applications: {
        starter: {
          identityApiUrl: process.env.ZOLTA_STARTER_IDENTITY_API_URL ?? 'http://localhost:8100',
          hostedAuthUrl: process.env.ZOLTA_STARTER_IDENTITY_AUTH_URL ?? 'http://localhost:3100',
          clientId: process.env.ZOLTA_STARTER_IDENTITY_CLIENT_ID ?? '',
          clientSecret: process.env.ZOLTA_STARTER_IDENTITY_CLIENT_SECRET ?? '',
          hostedApplication: process.env.ZOLTA_STARTER_IDENTITY_APPLICATION ?? 'starter',
          callbackUrl: process.env.ZOLTA_STARTER_IDENTITY_CALLBACK_URL ?? 'http://localhost:3000/api/identity/starter/auth/callback',
          sessionCookie: 'zolta-starter-identity-session',
          defaultRedirect: '/saas/dashboard'
        }
      }
    }
  },
  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'fr', name: 'Français', file: 'fr.json' }
    ],
    defaultLocale: 'en',
    langDir: 'locales'
  },
  routeRules: ({
    '/': { redirect: { to: '/en/saas', statusCode: 302 } },
    '/__nuxt_content/**': { csurf: false }
  } as any),
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NUXT_DEVTOOLS === 'true' },
  eslint: {
    config: {
      stylistic: { indent: 2, quotes: 'single', semi: false, commaDangle: 'never', braceStyle: '1tbs' }
    }
  }
})
