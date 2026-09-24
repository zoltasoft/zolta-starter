import { fileURLToPath } from 'node:url'

const projectsThemeCss = fileURLToPath(new URL('./assets/css/projects-theme.css', import.meta.url))

export default defineNuxtConfig({
  css: [projectsThemeCss],
  compatibilityDate: '2025-07-15'
})
