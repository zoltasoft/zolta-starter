export function useProjectsHomePresentation() {
  const { t } = useI18n()

  return computed(() => ({
    brand: t('projects.brand'),
    navigation: {
      product: t('projects.nav.product'),
      tasks: t('projects.nav.tasks'),
      login: t('projects.login'),
      dashboard: t('projects.dashboard'),
      start: t('projects.start')
    },
    footer: {
      product: t('projects.nav.product'),
      resources: t('projects.nav.documentation'),
      support: t('projects.nav.search'),
      features: t('projects.features.projects'),
      documentation: t('projects.nav.documentation'),
      description: t('projects.description')
    },
    hero: {
      title: t('projects.title'),
      description: t('projects.description'),
      start: t('projects.start'),
      seeTasks: t('projects.nav.tasks')
    },
    sections: [
      {
        title: t('projects.features.projects'),
        description: t('projects.description'),
        features: [
          { name: t('projects.features.projects'), description: t('projects.description'), icon: 'i-lucide-folder-kanban' },
          { name: t('projects.features.activity'), description: t('projects.description'), icon: 'i-lucide-user-round-check' },
          { name: t('projects.features.tasks'), description: t('projects.description'), icon: 'i-lucide-messages-square' }
        ]
      },
      {
        title: t('projects.features.tasks'),
        description: t('projects.description'),
        reverse: true,
        features: [
          { name: t('projects.filterStatus'), description: t('projects.description'), icon: 'i-lucide-list-checks' },
          { name: t('projects.filterPriority'), description: t('projects.description'), icon: 'i-lucide-flag' },
          { name: t('projects.searchTasks'), description: t('projects.description'), icon: 'i-lucide-search' }
        ]
      }
    ],
    features: {
      title: t('projects.features.title'),
      description: t('projects.features.description'),
      items: [
        { title: t('projects.features.projects'), description: t('projects.description'), icon: 'i-lucide-folder-kanban' },
        { title: t('projects.features.tasks'), description: t('projects.description'), icon: 'i-lucide-list-filter' },
        { title: t('projects.features.activity'), description: t('projects.description'), icon: 'i-lucide-history' }
      ]
    },
    faq: {
      headline: t('projects.eyebrow'),
      title: t('projects.title'),
      description: t('projects.description'),
      items: [
        { title: t('projects.features.projects'), description: t('projects.description') },
        { title: t('projects.features.tasks'), description: t('projects.description') },
        { title: t('projects.features.activity'), description: t('projects.description') }
      ]
    },
    cta: {
      title: t('projects.title'),
      description: t('projects.description'),
      open: t('projects.dashboard'),
      tasks: t('projects.nav.tasks')
    }
  }))
}
