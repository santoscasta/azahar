export type Language = 'es' | 'en'

type TranslationKey =
  | 'settings.title'
  | 'settings.subtitle'
  | 'settings.theme'
  | 'settings.themeHint'
  | 'settings.language'
  | 'settings.languageHint'
  | 'settings.reset'
  | 'settings.theme.option.system'
  | 'settings.theme.option.light'
  | 'settings.theme.option.dark'
  | 'sidebar.brand'
  | 'sidebar.workspace'
  | 'sidebar.settings'
  | 'sidebar.logout'
  | 'sidebar.inProgress'
  | 'sidebar.tasks'
  | 'sidebar.focus'
  | 'sidebar.areas'
  | 'sidebar.projects'
  | 'mobile.view'
  | 'mobile.project'
  | 'mobile.area'
  | 'mobile.today'
  | 'mobile.projectTasks'
  | 'mobile.areaProjects'
  | 'mobile.completed'
  | 'mobile.pending'

const translations: Record<Language, Record<TranslationKey, string>> = {
  es: {
    'settings.title': 'Ajustes',
    'settings.subtitle': 'Personaliza tu experiencia local (se guarda en este dispositivo).',
    'settings.theme': 'Tema',
    'settings.themeHint': 'Afecta sólo a este navegador.',
    'settings.language': 'Idioma UI',
    'settings.languageHint': 'Textos principales en la app.',
    'settings.reset': 'Restaurar valores por defecto',
    'settings.theme.option.system': 'Sistema',
    'settings.theme.option.light': 'Claro',
    'settings.theme.option.dark': 'Oscuro',
    'sidebar.brand': 'Azahar',
    'sidebar.workspace': 'Workspace',
    'sidebar.settings': 'Ajustes',
    'sidebar.logout': 'Salir',
    'sidebar.inProgress': 'En progreso',
    'sidebar.tasks': 'tareas',
    'sidebar.focus': 'Focus',
    'sidebar.areas': 'Áreas',
    'sidebar.projects': 'Proyectos',
    'mobile.view': 'Vista',
    'mobile.project': 'Proyecto',
    'mobile.area': 'Área',
    'mobile.today': 'Hoy',
    'mobile.projectTasks': 'tarea(s) en este proyecto',
    'mobile.areaProjects': 'proyecto(s)',
    'mobile.completed': 'completadas',
    'mobile.pending': 'Pendientes',
  },
  en: {
    'settings.title': 'Settings',
    'settings.subtitle': 'Personalize your local experience (stored on this device).',
    'settings.theme': 'Theme',
    'settings.themeHint': 'Affects only this browser.',
    'settings.language': 'UI language',
    'settings.languageHint': 'Main texts in the app.',
    'settings.reset': 'Reset to defaults',
    'settings.theme.option.system': 'System',
    'settings.theme.option.light': 'Light',
    'settings.theme.option.dark': 'Dark',
    'sidebar.brand': 'Azahar',
    'sidebar.workspace': 'Workspace',
    'sidebar.settings': 'Settings',
    'sidebar.logout': 'Log out',
    'sidebar.inProgress': 'In progress',
    'sidebar.tasks': 'tasks',
    'sidebar.focus': 'Focus',
    'sidebar.areas': 'Areas',
    'sidebar.projects': 'Projects',
    'mobile.view': 'View',
    'mobile.project': 'Project',
    'mobile.area': 'Area',
    'mobile.today': 'Today',
    'mobile.projectTasks': 'task(s) in this project',
    'mobile.areaProjects': 'project(s)',
    'mobile.completed': 'completed',
    'mobile.pending': 'Pending',
  },
}

export const translate = (lang: Language, key: TranslationKey) => translations[lang][key] ?? key
