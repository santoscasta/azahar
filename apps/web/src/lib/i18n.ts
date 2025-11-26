export type Language = 'es' | 'en'

type TranslationKey =
  | 'settings.title'
  | 'settings.subtitle'
  | 'settings.theme'
  | 'settings.themeHint'
  | 'settings.language'
  | 'settings.languageHint'
  | 'settings.back'
  | 'settings.reset'
  | 'settings.theme.option.system'
  | 'settings.theme.option.light'
  | 'settings.theme.option.dark'
  | 'settings.views.title'
  | 'settings.views.subtitle'
  | 'settings.views.inbox'
  | 'settings.views.today'
  | 'settings.views.upcoming'
  | 'settings.views.anytime'
  | 'settings.views.someday'
  | 'settings.views.logbook'
  | 'settings.completedContexts.title'
  | 'settings.completedContexts.description'
  | 'settings.completedContexts.visible'
  | 'settings.completedContexts.hidden'
  | 'settings.account'
  | 'settings.accountHint'
  | 'settings.logout.aria'
  | 'context.label.view'
  | 'context.label.project'
  | 'context.label.area'
  | 'context.pending'
  | 'context.overdue'
  | 'filters.all'
  | 'filters.important'
  | 'sidebar.brand'
  | 'sidebar.workspace'
  | 'sidebar.settings'
  | 'sidebar.logout'
  | 'sidebar.inProgress'
  | 'sidebar.tasks'
  | 'sidebar.focus'
  | 'sidebar.areas'
  | 'sidebar.projects'
  | 'sidebar.emptyAreas'
  | 'sidebar.noProjects'
  | 'mobile.view'
  | 'mobile.project'
  | 'mobile.area'
  | 'mobile.today'
  | 'mobile.projectTasks'
  | 'mobile.areaProjects'
  | 'mobile.completed'
  | 'mobile.pending'
  | 'view.inbox'
  | 'view.today'
  | 'view.upcoming'
  | 'view.anytime'
  | 'view.someday'
  | 'view.logbook'
  | 'view.desc.inbox'
  | 'view.desc.today'
  | 'view.desc.upcoming'
  | 'view.desc.anytime'
  | 'view.desc.someday'
  | 'view.desc.logbook'

const translations: Record<Language, Record<TranslationKey, string>> = {
  es: {
    'settings.title': 'Ajustes',
    'settings.subtitle': 'Personaliza tu experiencia local (se guarda en este dispositivo).',
    'settings.theme': 'Tema',
    'settings.themeHint': 'Afecta sólo a este navegador.',
    'settings.language': 'Idioma UI',
    'settings.languageHint': 'Textos principales en la app.',
    'settings.back': 'Volver a la app',
    'settings.reset': 'Restaurar valores por defecto',
    'settings.theme.option.system': 'Sistema',
    'settings.theme.option.light': 'Claro',
    'settings.theme.option.dark': 'Oscuro',
    'settings.views.title': 'Nombres de vistas',
    'settings.views.subtitle': 'Renombra las vistas rápidas para que hablen tu idioma o tu proceso.',
    'settings.views.inbox': 'Entrada sin clasificar',
    'settings.views.today': 'Tareas para hoy o atrasadas',
    'settings.views.upcoming': 'Próximos días/semanas',
    'settings.views.anytime': 'Sin fecha, cuando quieras',
    'settings.views.someday': 'Algún día, ideas aparcadas',
    'settings.views.logbook': 'Historial de completadas',
    'settings.completedContexts.title': 'Mostrar completadas en proyectos/áreas',
    'settings.completedContexts.description': 'Incluye una sección “Completadas” en vistas de proyecto y área.',
    'settings.completedContexts.visible': 'Visibles',
    'settings.completedContexts.hidden': 'Ocultas',
    'settings.account': 'Cuenta',
    'settings.accountHint': 'Cerrar sesión y volver a la pantalla de inicio',
    'settings.logout.aria': 'Cerrar sesión',
    'context.label.view': 'Vista',
    'context.label.project': 'Proyecto',
    'context.label.area': 'Área',
    'context.pending': 'Pendientes',
    'context.overdue': 'vencida(s)',
    'filters.all': 'Todo',
    'filters.important': 'Importantes',
    'sidebar.brand': 'Azahar',
    'sidebar.workspace': 'Workspace',
    'sidebar.settings': 'Ajustes',
    'sidebar.logout': 'Salir',
    'sidebar.inProgress': 'En progreso',
    'sidebar.tasks': 'tareas',
    'sidebar.focus': 'Focus',
    'sidebar.areas': 'Áreas',
    'sidebar.projects': 'Proyectos',
    'sidebar.emptyAreas': 'Crea tu primera área para organizarte.',
    'sidebar.noProjects': 'Sin proyectos todavía',
    'mobile.view': 'Vista',
    'mobile.project': 'Proyecto',
    'mobile.area': 'Área',
    'mobile.today': 'Hoy',
    'mobile.projectTasks': 'tarea(s) en este proyecto',
    'mobile.areaProjects': 'proyecto(s)',
    'mobile.completed': 'completadas',
    'mobile.pending': 'Pendientes',
    'view.inbox': 'Inbox',
    'view.today': 'Hoy',
    'view.upcoming': 'Próximas',
    'view.anytime': 'Cualquier momento',
    'view.someday': 'Algún día',
    'view.logbook': 'Registro',
    'view.desc.inbox': 'Captura ideas y tareas que aún no tienen hogar.',
    'view.desc.today': 'Todo lo que vence hoy y lo que se quedó atrás.',
    'view.desc.upcoming': 'Lo que está planificado para los próximos días y semanas.',
    'view.desc.anytime': 'Tareas sin fecha que podrás programar después.',
    'view.desc.someday': 'Ideas para más adelante, sin presión.',
    'view.desc.logbook': 'Un registro de todo lo que has terminado.',
  },
  en: {
    'settings.title': 'Settings',
    'settings.subtitle': 'Personalize your local experience (stored on this device).',
    'settings.theme': 'Theme',
    'settings.themeHint': 'Affects only this browser.',
    'settings.language': 'UI language',
    'settings.languageHint': 'Main texts in the app.',
    'settings.back': 'Back to app',
    'settings.reset': 'Reset to defaults',
    'settings.theme.option.system': 'System',
    'settings.theme.option.light': 'Light',
    'settings.theme.option.dark': 'Dark',
    'settings.views.title': 'View names',
    'settings.views.subtitle': 'Rename quick views to match your language or workflow.',
    'settings.views.inbox': 'Unsorted intake',
    'settings.views.today': 'Due today or overdue',
    'settings.views.upcoming': 'Next days/weeks',
    'settings.views.anytime': 'No date, whenever',
    'settings.views.someday': 'Someday, parked ideas',
    'settings.views.logbook': 'History of done tasks',
    'settings.completedContexts.title': 'Show completed in projects/areas',
    'settings.completedContexts.description': 'Adds a “Completed” section in project and area views.',
    'settings.completedContexts.visible': 'Visible',
    'settings.completedContexts.hidden': 'Hidden',
    'settings.account': 'Account',
    'settings.accountHint': 'Log out and return to the start screen',
    'settings.logout.aria': 'Log out',
    'context.label.view': 'View',
    'context.label.project': 'Project',
    'context.label.area': 'Area',
    'context.pending': 'Pending',
    'context.overdue': 'overdue',
    'filters.all': 'All',
    'filters.important': 'Important',
    'sidebar.brand': 'Azahar',
    'sidebar.workspace': 'Workspace',
    'sidebar.settings': 'Settings',
    'sidebar.logout': 'Log out',
    'sidebar.inProgress': 'In progress',
    'sidebar.tasks': 'tasks',
    'sidebar.focus': 'Focus',
    'sidebar.areas': 'Areas',
    'sidebar.projects': 'Projects',
    'sidebar.emptyAreas': 'Create your first area to organize your work.',
    'sidebar.noProjects': 'No projects yet',
    'mobile.view': 'View',
    'mobile.project': 'Project',
    'mobile.area': 'Area',
    'mobile.today': 'Today',
    'mobile.projectTasks': 'task(s) in this project',
    'mobile.areaProjects': 'project(s)',
    'mobile.completed': 'completed',
    'mobile.pending': 'Pending',
    'view.inbox': 'Inbox',
    'view.today': 'Today',
    'view.upcoming': 'Upcoming',
    'view.anytime': 'Anytime',
    'view.someday': 'Someday',
    'view.logbook': 'Logbook',
    'view.desc.inbox': 'Capture ideas and tasks that still need a home.',
    'view.desc.today': 'Everything due today plus anything that slipped through.',
    'view.desc.upcoming': 'What is planned for the next days and weeks.',
    'view.desc.anytime': 'Tasks without a date live here until you schedule them.',
    'view.desc.someday': 'A parking lot for ideas you want to revisit later.',
    'view.desc.logbook': 'A record of everything you have finished.',
  },
}

export const translate = (lang: Language, key: TranslationKey) => translations[lang][key] ?? key
