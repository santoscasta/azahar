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
  | 'gtd.title'
  | 'gtd.subtitle'
  | 'gtd.switchClassic'
  | 'gtd.settings'
  | 'gtd.capture'
  | 'gtd.capture.subtitle'
  | 'gtd.clarify'
  | 'gtd.clarify.subtitle'
  | 'gtd.organize'
  | 'gtd.organize.subtitle'
  | 'gtd.reflect'
  | 'gtd.reflect.subtitle'
  | 'gtd.engage'
  | 'gtd.engage.subtitle'
  | 'gtd.quickCapture.placeholder'
  | 'gtd.quickCapture.notes'
  | 'gtd.quickCapture.cta'
  | 'gtd.quickCapture.saving'
  | 'gtd.noNotes'
  | 'gtd.markDone'
  | 'gtd.markOpen'
  | 'gtd.empty'
  | 'gtd.due'
  | 'auth.title.login'
  | 'auth.title.signup'
  | 'auth.tagline'
  | 'auth.email.label'
  | 'auth.email.placeholder'
  | 'auth.email.hint'
  | 'auth.email.error'
  | 'auth.password.label'
  | 'auth.password.placeholder'
  | 'auth.password.hint'
  | 'auth.password.error'
  | 'auth.password.toggle.show'
  | 'auth.password.toggle.hide'
  | 'auth.cta.login'
  | 'auth.cta.signup'
  | 'auth.cta.loading'
  | 'auth.switch.toLoginQuestion'
  | 'auth.switch.toSignupQuestion'
  | 'auth.switch.toLogin'
  | 'auth.switch.toSignup'
  | 'auth.forgot'
  | 'auth.error.inputInvalid'
  | 'auth.error.unknown'
  | 'status.offline'
  | 'status.pendingSync'
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
  | 'view.search'
  | 'view.desc.inbox'
  | 'view.desc.today'
  | 'view.desc.upcoming'
  | 'view.desc.anytime'
  | 'view.desc.someday'
  | 'view.desc.logbook'
  | 'view.desc.search'

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
    'gtd.title': 'Comando GTD',
    'gtd.subtitle': 'Una sala de control para capturar, aclarar, organizar y ejecutar sin perder contexto.',
    'gtd.switchClassic': 'Volver a la vista clásica',
    'gtd.settings': 'Ajustes',
    'gtd.capture': 'Capturar',
    'gtd.capture.subtitle': 'Entrada sin fricción',
    'gtd.clarify': 'Aclarar',
    'gtd.clarify.subtitle': 'Enfócate en lo que toca hoy',
    'gtd.organize': 'Organizar',
    'gtd.organize.subtitle': 'Planea próximos pasos',
    'gtd.reflect': 'Reflexionar',
    'gtd.reflect.subtitle': 'Incuba y revisa',
    'gtd.engage': 'Enganchar',
    'gtd.engage.subtitle': 'Cierra ciclos',
    'gtd.quickCapture.placeholder': 'Captura en un solo campo: “Enviar briefing a Juan mañana”',
    'gtd.quickCapture.notes': 'Notas rápidas, checklist mental o contexto adicional (opcional)',
    'gtd.quickCapture.cta': 'Añadir',
    'gtd.quickCapture.saving': 'Guardando...',
    'gtd.noNotes': 'Sin notas adicionales',
    'gtd.markDone': 'Marcar como hecha',
    'gtd.markOpen': 'Reabrir',
    'gtd.empty': 'Nada aquí todavía. Respira, prioriza o captura algo nuevo.',
    'gtd.due': 'Vence',
    'auth.title.login': 'Inicia sesión',
    'auth.title.signup': 'Crea tu cuenta',
    'auth.tagline': 'Organiza tus tareas con calma y sin distracciones.',
    'auth.email.label': 'Email',
    'auth.email.placeholder': 'tu@ejemplo.com',
    'auth.email.hint': 'Usa un correo con formato nombre@dominio.com',
    'auth.email.error': 'Introduce un email válido.',
    'auth.password.label': 'Contraseña',
    'auth.password.placeholder': '••••••••',
    'auth.password.hint': 'Mínimo 8 caracteres.',
    'auth.password.error': 'Añade un poco más para mayor seguridad.',
    'auth.password.toggle.show': 'Mostrar contraseña',
    'auth.password.toggle.hide': 'Ocultar contraseña',
    'auth.cta.login': 'Entrar',
    'auth.cta.signup': 'Registrarse',
    'auth.cta.loading': 'Cargando...',
    'auth.switch.toLoginQuestion': '¿Ya tienes cuenta?',
    'auth.switch.toSignupQuestion': '¿No tienes cuenta?',
    'auth.switch.toLogin': 'Inicia sesión',
    'auth.switch.toSignup': 'Regístrate',
    'auth.forgot': '¿Olvidaste tu contraseña?',
    'auth.error.inputInvalid': 'Revisa el email y la contraseña antes de continuar',
    'auth.error.unknown': 'Error inesperado',
    'status.offline': 'Trabajando sin conexión. Los cambios se sincronizarán al volver.',
    'status.pendingSync': 'Hay cambios pendientes por sincronizar.',
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
    'view.search': 'Búsqueda',
    'view.desc.inbox': 'Captura ideas y tareas que aún no tienen hogar.',
    'view.desc.today': 'Todo lo que vence hoy y lo que se quedó atrás.',
    'view.desc.upcoming': 'Lo que está planificado para los próximos días y semanas.',
    'view.desc.anytime': 'Tareas sin fecha que podrás programar después.',
    'view.desc.someday': 'Ideas para más adelante, sin presión.',
    'view.desc.logbook': 'Un registro de todo lo que has terminado.',
    'view.desc.search': 'Resultados en todas las vistas (completadas sólo si lo tienes activado).',
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
    'gtd.title': 'GTD Command Center',
    'gtd.subtitle': 'A radical control room to capture, clarify, organize, and execute with zero friction.',
    'gtd.switchClassic': 'Back to classic view',
    'gtd.settings': 'Settings',
    'gtd.capture': 'Capture',
    'gtd.capture.subtitle': 'Frictionless inboxing',
    'gtd.clarify': 'Clarify',
    'gtd.clarify.subtitle': 'What deserves attention today',
    'gtd.organize': 'Organize',
    'gtd.organize.subtitle': 'Stage the next moves',
    'gtd.reflect': 'Reflect',
    'gtd.reflect.subtitle': 'Incubate and review',
    'gtd.engage': 'Engage',
    'gtd.engage.subtitle': 'Close loops',
    'gtd.quickCapture.placeholder': 'Capture in one field: “Send briefing to Sarah tomorrow”',
    'gtd.quickCapture.notes': 'Quick notes, mental checklist, or extra context (optional)',
    'gtd.quickCapture.cta': 'Add',
    'gtd.quickCapture.saving': 'Saving...',
    'gtd.noNotes': 'No extra notes',
    'gtd.markDone': 'Mark done',
    'gtd.markOpen': 'Reopen',
    'gtd.empty': 'Nothing here yet. Breathe, prioritize, or capture something new.',
    'gtd.due': 'Due',
    'auth.title.login': 'Sign in',
    'auth.title.signup': 'Create your account',
    'auth.tagline': 'Organize your tasks calmly and without distractions.',
    'auth.email.label': 'Email',
    'auth.email.placeholder': 'you@example.com',
    'auth.email.hint': 'Use an email with the format name@domain.com',
    'auth.email.error': 'Enter a valid email.',
    'auth.password.label': 'Password',
    'auth.password.placeholder': '••••••••',
    'auth.password.hint': 'At least 8 characters.',
    'auth.password.error': 'Add a bit more for better security.',
    'auth.password.toggle.show': 'Show password',
    'auth.password.toggle.hide': 'Hide password',
    'auth.cta.login': 'Log in',
    'auth.cta.signup': 'Sign up',
    'auth.cta.loading': 'Loading...',
    'auth.switch.toLoginQuestion': 'Already have an account?',
    'auth.switch.toSignupQuestion': 'Don’t have an account?',
    'auth.switch.toLogin': 'Sign in',
    'auth.switch.toSignup': 'Create account',
    'auth.forgot': 'Forgot your password?',
    'auth.error.inputInvalid': 'Check your email and password before continuing',
    'auth.error.unknown': 'Unexpected error',
    'status.offline': 'Working offline. Changes will sync when you are back online.',
    'status.pendingSync': 'There are unsynced changes pending.',
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
    'view.search': 'Search',
    'view.desc.inbox': 'Capture ideas and tasks that still need a home.',
    'view.desc.today': 'Everything due today plus anything that slipped through.',
    'view.desc.upcoming': 'What is planned for the next days and weeks.',
    'view.desc.anytime': 'Tasks without a date live here until you schedule them.',
    'view.desc.someday': 'A parking lot for ideas you want to revisit later.',
    'view.desc.logbook': 'A record of everything you have finished.',
    'view.desc.search': 'Results across all lists (done items only if enabled).',
  },
}

export const translate = (lang: Language, key: TranslationKey) => translations[lang][key] ?? key
