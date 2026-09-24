const starterIdentityApplication = {
  identityApiUrl: process.env.ZOLTA_STARTER_IDENTITY_API_URL ?? 'http://localhost:8100',
  hostedAuthUrl: process.env.ZOLTA_STARTER_IDENTITY_AUTH_URL ?? 'http://localhost:3100',
  clientId: process.env.ZOLTA_STARTER_IDENTITY_CLIENT_ID ?? '',
  clientSecret: process.env.ZOLTA_STARTER_IDENTITY_CLIENT_SECRET ?? '',
  hostedApplication: process.env.ZOLTA_STARTER_IDENTITY_APPLICATION ?? 'zoltasoft-starter',
  callbackUrl: process.env.ZOLTA_STARTER_IDENTITY_CALLBACK_URL ?? 'http://localhost:3000/api/identity/starter/auth/callback',
  sessionCookie: 'zolta-starter-identity-session',
  defaultRedirect: '/dashboard'
}

const projectsIdentityApplication = {
  identityApiUrl: process.env.ZOLTA_PROJECTS_IDENTITY_API_URL ?? 'http://localhost:8201',
  hostedAuthUrl: process.env.ZOLTA_PROJECTS_IDENTITY_AUTH_URL ?? 'http://localhost:3201',
  clientId: process.env.ZOLTA_PROJECTS_IDENTITY_CLIENT_ID ?? '',
  clientSecret: process.env.ZOLTA_PROJECTS_IDENTITY_CLIENT_SECRET ?? '',
  hostedApplication: process.env.ZOLTA_PROJECTS_IDENTITY_APPLICATION ?? 'tasks-demo',
  callbackUrl: process.env.ZOLTA_PROJECTS_IDENTITY_CALLBACK_URL ?? 'http://localhost:3300/api/identity/projects/auth/callback',
  sessionCookie: 'zolta-projects-identity-session',
  defaultRedirect: '/projects/dashboard'
}

const viteAllowedHosts = [
  'localhost',
  '127.0.0.1',
  ...(process.env.NUXT_VITE_ALLOWED_HOSTS ?? '')
    .split(',')
    .map(host => host.trim())
    .filter(Boolean)
]

export default defineNuxtConfig({
  extends: [
    './layers/dashboard',
    './layers/saas',
    './layers/projects',
    './packages/i18n',
    './packages/nuxt-content',
    './packages/ui'
  ],
  icon: {
    clientBundle: {
      scan: true,
      icons: ['lucide:orbit', 'lucide:sparkles', 'lucide:house', 'lucide:kanban-square', 'lucide:check-circle-2', 'lucide:shield-check', 'lucide:layout-dashboard', 'lucide:list-checks', 'lucide:folder-kanban', 'lucide:log-out', 'lucide:plus', 'lucide:arrow-right', 'lucide:arrow-up-right', 'lucide:file-text']
    }
  },
  modules: [
    '@nuxt/eslint',
    '@vueuse/nuxt',
    'nuxt-auth-utils',
    'nuxt-csurf',
    '@zoltasoft/identity-consumer-nuxt'
  ],
  runtimeConfig: {
    public: {
      siteUrl: process.env.ZOLTA_STARTER_SITE_URL ?? 'http://localhost:3300',
      zoltasoftSiteUrl: process.env.NUXT_PUBLIC_ZOLTASOFT_SITE_URL ?? 'http://localhost:3000',
      identityAuthUrl: process.env.NUXT_PUBLIC_IDENTITY_AUTH_URL ?? 'http://localhost:3201'
    },
    zoltaIdentity: {
      sessionSecret: process.env.NUXT_ZOLTA_IDENTITY_SESSION_SECRET ?? '',
      applications: {
        starter: starterIdentityApplication,
        'zoltasoft-starter': starterIdentityApplication,
        'starter-demo': starterIdentityApplication,
        projects: projectsIdentityApplication,
        'tasks-demo': projectsIdentityApplication
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
    '/__nuxt_content/**': { csurf: false }
  } as any),
  vite: {
    server: {
      allowedHosts: viteAllowedHosts
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NUXT_DEVTOOLS === 'true' },
  eslint: {
    config: {
      stylistic: { indent: 2, quotes: 'single', semi: false, commaDangle: 'never', braceStyle: '1tbs' }
    }
  }
})
