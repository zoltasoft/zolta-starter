const english = {
  brand: 'Zoltasoft SaaS',
  navigation: {
    product: 'Product',
    pricing: 'Pricing',
    changelog: 'Changelog',
    login: 'Log in',
    start: 'Start free',
    dashboard: 'Dashboard'
  },
  footer: {
    description: 'A fictional SaaS product demonstrating a complete, reusable marketing, authentication, and dashboard foundation.',
    product: 'Product',
    resources: 'Resources',
    legal: 'Legal',
    features: 'Features',
    support: 'Support',
    terms: 'Terms',
    privacy: 'Privacy'
  },
  pricing: {
    eyebrow: 'Simple pricing',
    title: 'Start small. Scale when the work does.',
    description: 'Every plan includes the complete Zoltasoft SaaS workflow. Upgrade when your team needs more automation, history, and governance.',
    monthly: 'Monthly',
    yearly: 'Yearly',
    yearlySaving: 'Save 20%',
    free: 'Free',
    currency: '$',
    perMonth: '/ month',
    billedYearly: 'billed yearly',
    action: 'Start free',
    popular: 'Most popular',
    plans: [
      {
        name: 'Starter',
        description: 'For individuals organizing their first repeatable workflows.',
        monthly: 0,
        yearly: 0,
        features: ['One workspace', 'Three active workflows', 'Core integrations', 'Seven-day activity history']
      },
      {
        name: 'Growth',
        description: 'For teams coordinating work across tools and responsibilities.',
        monthly: 24,
        yearly: 19,
        popular: true,
        features: ['Unlimited workflows', 'Automation builder', 'Team roles and permissions', 'One-year activity history', 'Priority support']
      },
      {
        name: 'Scale',
        description: 'For organizations that need control, visibility, and support.',
        monthly: 79,
        yearly: 63,
        features: ['Everything in Growth', 'SAML single sign-on', 'Audit exports', 'Advanced governance', 'Dedicated onboarding']
      }
    ],
    faqTitle: 'Pricing questions',
    faq: [
      { label: 'Can I try paid features first?', content: 'Yes. Growth starts with a 14-day trial and does not require a credit card.' },
      { label: 'Can I change plans later?', content: 'Upgrade, downgrade, or cancel from billing settings. Changes are prorated automatically.' },
      { label: 'What happens when the trial ends?', content: 'Your workspace returns to Starter. Your data remains available and you can upgrade at any time.' },
      { label: 'Do you offer annual billing?', content: 'Yes. Annual billing reduces the effective monthly price by twenty percent.' }
    ]
  },
  legal: {
    termsTitle: 'Terms of service',
    privacyTitle: 'Privacy policy',
    updated: 'Template copy · July 2026',
    notice: 'Zoltasoft SaaS is a fictional product demonstration. Replace this template copy with legal text reviewed for your company, product, and jurisdiction before launching a real service.',
    terms: [
      { title: 'Using the service', body: 'You are responsible for the activity in your workspace and for using the service lawfully. Access may be limited when required to protect the service, other users, or the public.' },
      { title: 'Accounts and content', body: 'You keep ownership of content you submit. You grant the service only the permissions needed to store, process, and present that content as part of the requested features.' },
      { title: 'Demo accounts', body: 'Temporary demo accounts exist for product evaluation. They expire automatically and their associated data is scheduled for deletion, so they must not contain important or sensitive information.' },
      { title: 'Changes and availability', body: 'Features may evolve, pause, or be removed. A production service should publish material changes and define service commitments in its commercial agreement.' }
    ],
    privacy: [
      { title: 'Data we process', body: 'A production deployment may process account identity, workspace content, product activity, device information, and support messages needed to operate and protect the service.' },
      { title: 'How data is used', body: 'Data is used to provide requested features, maintain security, understand reliability, communicate service updates, and satisfy legal obligations.' },
      { title: 'Temporary demonstrations', body: 'Demo credentials have a defined expiration. When the temporary session expires, cleanup removes the demo user and data owned by that account through the application lifecycle.' },
      { title: 'Your controls', body: 'The product foundation supports clear account controls. A production policy should explain access, correction, export, retention, deletion, and contact rights for each supported region.' }
    ]
  },
  auth: {
    demoTitle: 'Try the complete Zoltasoft SaaS demo',
    demoDescription: 'Generate a private temporary account, sign in, and explore the authenticated SaaS shell. Demo data is scheduled for deletion when the session expires.'
  },
  changelog: {
    eyebrow: 'Product updates',
    title: 'What is new in Zoltasoft SaaS',
    description: 'A reusable changelog pattern for communicating improvements clearly and consistently.',
    entries: [
      { version: '1.4.0', date: 'July 2026', title: 'Workflow templates', description: 'Save repeatable processes as templates, share them across workspaces, and control who can publish changes.', tags: ['Product', 'Teams'] },
      { version: '1.3.0', date: 'June 2026', title: 'Automation history', description: 'Inspect every automation run with inputs, decisions, results, and retry controls in one timeline.', tags: ['Automation', 'Observability'] },
      { version: '1.2.0', date: 'May 2026', title: 'Workspace insights', description: 'New cycle-time, workload, and completion reports help teams find friction without building spreadsheets.', tags: ['Analytics'] },
      { version: '1.1.0', date: 'April 2026', title: 'Connected work', description: 'Slack, GitHub, Linear, and email integrations can now trigger workflows and synchronize status.', tags: ['Integrations'] }
    ]
  },
  dashboard: {
    overview: 'Overview',
    settings: 'Settings',
    product: 'Product website',
    support: 'Help & support',
    primaryNavigation: 'Zoltasoft SaaS dashboard navigation',
    secondaryNavigation: 'Zoltasoft SaaS resource navigation',
    search: 'Search Zoltasoft SaaS',
    welcomeEyebrow: 'Zoltasoft SaaS workspace',
    welcome: 'Welcome, {name}',
    description: 'Your SaaS foundation is ready. Replace this welcome state with the product modules your next idea needs.',
    demoNote: 'This intentionally minimal dashboard demonstrates the authenticated shell, responsive sidebar, user menu, localization, appearance controls, and account lifecycle without inventing unfinished product data.',
    settingsTitle: 'Workspace settings',
    settingsDescription: 'A neutral settings foundation ready for the preferences and controls of a future product.',
    account: 'Signed-in account',
    preferences: 'Interface preferences',
    preferencesDescription: 'Language and appearance controls are ready to reuse across a future product.'
  }
} as const

const french = {
  brand: 'Zoltasoft SaaS',
  navigation: {
    product: 'Produit',
    pricing: 'Tarifs',
    changelog: 'Nouveautés',
    login: 'Connexion',
    start: 'Commencer',
    dashboard: 'Tableau de bord'
  },
  footer: {
    description: 'Un produit SaaS fictif qui démontre une fondation complète et réutilisable : marketing, authentification et tableau de bord.',
    product: 'Produit',
    resources: 'Ressources',
    legal: 'Légal',
    features: 'Fonctionnalités',
    support: 'Assistance',
    terms: 'Conditions',
    privacy: 'Confidentialité'
  },
  pricing: {
    eyebrow: 'Tarification simple',
    title: 'Commencez simplement. Évoluez avec votre activité.',
    description: 'Chaque offre comprend le parcours Zoltasoft SaaS complet. Passez au niveau supérieur lorsque votre équipe a besoin de plus d’automatisation, d’historique et de gouvernance.',
    monthly: 'Mensuel',
    yearly: 'Annuel',
    yearlySaving: 'Économisez 20 %',
    free: 'Gratuit',
    currency: '$',
    perMonth: '/ mois',
    billedYearly: 'facturé annuellement',
    action: 'Commencer gratuitement',
    popular: 'Le plus populaire',
    plans: [
      {
        name: 'Starter',
        description: 'Pour les personnes qui organisent leurs premiers processus réutilisables.',
        monthly: 0,
        yearly: 0,
        features: ['Un espace de travail', 'Trois processus actifs', 'Intégrations principales', 'Sept jours d’historique']
      },
      {
        name: 'Growth',
        description: 'Pour les équipes qui coordonnent leur travail entre plusieurs outils.',
        monthly: 24,
        yearly: 19,
        popular: true,
        features: ['Processus illimités', 'Constructeur d’automatisations', 'Rôles et permissions', 'Un an d’historique', 'Assistance prioritaire']
      },
      {
        name: 'Scale',
        description: 'Pour les organisations qui exigent contrôle, visibilité et accompagnement.',
        monthly: 79,
        yearly: 63,
        features: ['Tout Growth', 'Authentification SAML', 'Exports d’audit', 'Gouvernance avancée', 'Accompagnement dédié']
      }
    ],
    faqTitle: 'Questions sur les tarifs',
    faq: [
      { label: 'Puis-je essayer les fonctions payantes ?', content: 'Oui. Growth commence par un essai de 14 jours sans carte bancaire.' },
      { label: 'Puis-je changer d’offre ?', content: 'Vous pouvez changer ou annuler depuis la facturation. Les modifications sont calculées au prorata.' },
      { label: 'Que se passe-t-il après l’essai ?', content: 'Votre espace repasse à Starter. Vos données restent disponibles et vous pouvez évoluer à tout moment.' },
      { label: 'Proposez-vous une facturation annuelle ?', content: 'Oui. La facturation annuelle réduit le prix mensuel effectif de vingt pour cent.' }
    ]
  },
  legal: {
    termsTitle: 'Conditions d’utilisation',
    privacyTitle: 'Politique de confidentialité',
    updated: 'Texte modèle · Juillet 2026',
    notice: 'Zoltasoft SaaS est une démonstration de produit fictif. Avant tout lancement réel, remplacez ce texte modèle par des conditions révisées pour votre entreprise, votre produit et votre juridiction.',
    terms: [
      { title: 'Utilisation du service', body: 'Vous êtes responsable de l’activité de votre espace et d’une utilisation conforme à la loi. L’accès peut être limité afin de protéger le service, les autres utilisateurs ou le public.' },
      { title: 'Comptes et contenu', body: 'Vous restez propriétaire du contenu transmis. Vous accordez uniquement les permissions nécessaires à son stockage, son traitement et sa présentation dans les fonctions demandées.' },
      { title: 'Comptes de démonstration', body: 'Les comptes temporaires servent à évaluer le produit. Ils expirent automatiquement et leurs données sont programmées pour suppression ; ils ne doivent donc contenir aucune information importante ou sensible.' },
      { title: 'Évolutions et disponibilité', body: 'Les fonctions peuvent évoluer, être interrompues ou supprimées. Un service en production doit communiquer les changements importants et définir ses engagements dans son accord commercial.' }
    ],
    privacy: [
      { title: 'Données traitées', body: 'Un déploiement réel peut traiter l’identité du compte, le contenu des espaces, l’activité produit, les informations de l’appareil et les messages d’assistance nécessaires au fonctionnement et à la protection du service.' },
      { title: 'Utilisation des données', body: 'Les données servent à fournir les fonctions demandées, maintenir la sécurité, comprendre la fiabilité, communiquer les évolutions et respecter les obligations légales.' },
      { title: 'Démonstrations temporaires', body: 'Les identifiants de démonstration possèdent une expiration définie. À la fin de la session temporaire, le nettoyage supprime l’utilisateur de démonstration et les données qui lui appartiennent.' },
      { title: 'Vos contrôles', body: 'La fondation prévoit des contrôles de compte explicites. Une politique réelle doit expliquer les droits d’accès, de correction, d’export, de conservation et de suppression pour chaque région prise en charge.' }
    ]
  },
  auth: {
    demoTitle: 'Essayez la démonstration Zoltasoft SaaS complète',
    demoDescription: 'Générez un compte privé temporaire, connectez-vous et explorez la zone SaaS authentifiée. Les données de démonstration sont programmées pour suppression à l’expiration de la session.'
  },
  changelog: {
    eyebrow: 'Mises à jour produit',
    title: 'Les nouveautés de Zoltasoft SaaS',
    description: 'Un modèle de changelog réutilisable pour communiquer les améliorations clairement et régulièrement.',
    entries: [
      { version: '1.4.0', date: 'Juillet 2026', title: 'Modèles de processus', description: 'Enregistrez les processus récurrents, partagez-les entre espaces et contrôlez la publication des changements.', tags: ['Produit', 'Équipes'] },
      { version: '1.3.0', date: 'Juin 2026', title: 'Historique des automatisations', description: 'Inspectez chaque exécution avec ses entrées, décisions, résultats et contrôles de relance.', tags: ['Automatisation', 'Observabilité'] },
      { version: '1.2.0', date: 'Mai 2026', title: 'Analyses de l’espace', description: 'De nouveaux rapports sur les cycles, la charge et les résultats révèlent les frictions sans tableur.', tags: ['Analyses'] },
      { version: '1.1.0', date: 'Avril 2026', title: 'Travail connecté', description: 'Les intégrations Slack, GitHub, Linear et email peuvent déclencher des processus et synchroniser les statuts.', tags: ['Intégrations'] }
    ]
  },
  dashboard: {
    overview: 'Vue d’ensemble',
    settings: 'Paramètres',
    product: 'Site du produit',
    support: 'Aide et assistance',
    primaryNavigation: 'Navigation du tableau de bord Zoltasoft SaaS',
    secondaryNavigation: 'Navigation des ressources Zoltasoft SaaS',
    search: 'Rechercher dans Zoltasoft SaaS',
    welcomeEyebrow: 'Espace Zoltasoft SaaS',
    welcome: 'Bienvenue, {name}',
    description: 'Votre fondation SaaS est prête. Remplacez cet accueil par les modules nécessaires à votre prochaine idée.',
    demoNote: 'Ce tableau de bord volontairement minimal démontre la zone authentifiée, la barre latérale responsive, le menu utilisateur, la traduction, les thèmes et le cycle de vie du compte sans inventer de fausses données produit.',
    settingsTitle: 'Paramètres de l’espace',
    settingsDescription: 'Une fondation de paramètres neutre, prête à accueillir les préférences et contrôles d’un futur produit.',
    account: 'Compte connecté',
    preferences: 'Préférences de l’interface',
    preferencesDescription: 'Les contrôles de langue et d’apparence sont prêts à être réutilisés dans un futur produit.'
  }
} as const

export function useSaasTemplatePresentation() {
  const { locale } = useI18n()

  return computed(() => locale.value === 'fr' ? french : english)
}
