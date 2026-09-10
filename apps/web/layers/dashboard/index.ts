import { fileURLToPath } from 'node:url'
import { createBarrelAliases } from '../../shared/utils/alias-utils'

export const dashboardDir = fileURLToPath(new URL('./', import.meta.url))

export const dashboardAliases = {
  ...createBarrelAliases(import.meta.url, '#dashboard'),
  '#dashboard': dashboardDir
} as const

export const dashboardCompatibilityDate = '2024-07-11'
