import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/content'],
  content: {
    build: {
      markdown: {
        highlight: false
      }
    }
  },
  mdc: {
    highlight: false
  },
  compatibilityDate: '2025-07-15'
})
