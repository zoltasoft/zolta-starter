import {
  landingAliases,
  landingCompatibilityDate,
  landingRouteRules
} from './index'

export default defineNuxtConfig({
  modules: [],
  alias: {
    ...landingAliases
  },
  routeRules: landingRouteRules,
  compatibilityDate: landingCompatibilityDate
})
