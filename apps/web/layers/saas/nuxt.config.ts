import {
  landingAliases,
  landingCompatibilityDate,
  landingRouteRules
} from './index'
import { fileURLToPath } from 'node:url'

const saasThemeCss = fileURLToPath(new URL('./assets/css/saas-theme.css', import.meta.url))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    zoltaIdentity: {
      applications: {
        starter: {
          identityApiUrl: process.env.ZOLTA_STARTER_IDENTITY_API_URL ?? process.env.IDENTITY_API_URL ?? 'http://localhost:8100',
          hostedAuthUrl: process.env.ZOLTA_STARTER_IDENTITY_AUTH_URL ?? 'http://localhost:3100',
          clientId: process.env.ZOLTA_STARTER_IDENTITY_CLIENT_ID ?? '',
          clientSecret: process.env.ZOLTA_STARTER_IDENTITY_CLIENT_SECRET ?? '',
          hostedApplication: process.env.ZOLTA_STARTER_IDENTITY_HOSTED_APPLICATION ?? 'starter',
          callbackUrl: process.env.ZOLTA_STARTER_IDENTITY_CALLBACK_URL ?? 'http://localhost:3000/api/identity/starter/auth/callback',
          sessionCookie: 'starter-identity-session',
          defaultRedirect: '/dashboard'
        }
      }
    }
  },
  modules: [],
  css: [saasThemeCss],
  alias: {
    ...landingAliases
  },
  routeRules: landingRouteRules,
  compatibilityDate: landingCompatibilityDate
})
