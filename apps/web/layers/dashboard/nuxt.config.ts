import { dashboardAliases, dashboardCompatibilityDate } from './index'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [],
  alias: {
    ...dashboardAliases
  },
  compatibilityDate: dashboardCompatibilityDate
})
