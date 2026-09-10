import { fileURLToPath } from 'node:url'

const chatDir = fileURLToPath(new URL('./', import.meta.url))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/mdc', 'nuxt-charts'],
  alias: {
    '#chat': chatDir
  },
  mdc: {
    headings: {
      anchorLinks: false
    },
    highlight: {
      shikiEngine: 'javascript'
    }
  },
  vite: {
    optimizeDeps: {
      include: [
        'striptags',
        '@ai-sdk/gateway > @vercel/oidc'
      ]
    }
  }
})
