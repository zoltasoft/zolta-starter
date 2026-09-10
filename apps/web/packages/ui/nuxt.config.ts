import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'

const uiAssetsDir = fileURLToPath(new URL('./assets', import.meta.url))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: {
    '#ui-assets': uiAssetsDir
  },
  modules: ['@nuxt/image', '@nuxt/ui', 'nuxt-og-image', 'motion-v/nuxt'],
  experimental: {
    viewTransition: true
  },
  css: ['#ui-assets/css/main.css'],
  compatibilityDate: '2025-07-15'
})
