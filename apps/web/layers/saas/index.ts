import { fileURLToPath } from 'node:url'

export const landingDir = fileURLToPath(new URL('./', import.meta.url))

export const landingAliases = {
  '#landing': landingDir
} as const

export const landingRouteRules = {
  '/docs-lab': { redirect: '/docs-lab/getting-started', prerender: false }
} as const

export const landingCompatibilityDate = '2024-07-11'
