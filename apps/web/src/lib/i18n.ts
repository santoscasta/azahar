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
  | 'settings.views.waiting'
  | 'settings.views.someday'
  | 'settings.views.reference'
  | 'settings.views.logbook'
  | 'settings.completedContexts.title'
  | 'settings.completedContexts.description'
  | 'settings.completedContexts.visible'
  | 'settings.completedContexts.hidden'
  | 'settings.mobilePreview.title'
  | 'settings.mobilePreview.description'
  | 'settings.mobilePreview.enabled'
  | 'settings.mobilePreview.disabled'
  | 'settings.account'
  | 'settings.accountHint'
  | 'settings.logout.aria'
  | 'context.label.view'
  | 'context.label.project'
  | 'context.label.area'
  | 'context.label.section'
  | 'context.pending'
  | 'context.overdue'
  | 'filters.all'
  | 'filters.important'
  | 'sidebar.brand'
  | 'sidebar.workspace'
  | 'sidebar.settings'
  | 'sidebar.help'
  | 'sidebar.logout'
  | 'sidebar.inProgress'
  | 'sidebar.tasks'
  | 'sidebar.focus'
  | 'sidebar.areas'
  | 'sidebar.projects'
  | 'sidebar.emptyAreas'
  | 'sidebar.newList'
  | 'sidebar.newProject'
  | 'sidebar.newProject.desc'
  | 'sidebar.newArea'
  | 'sidebar.newArea.desc'
  | 'search.title'
  | 'search.placeholder'
  | 'search.noResults'
  | 'search.navigate'
  | 'search.type.task'
  | 'search.type.project'
  | 'search.type.area'
  | 'search.type.view'
  | 'search.clear'
  | 'search.suggestions.title'
  | 'search.suggestions.empty'
  | 'search.suggestions.project'
  | 'search.suggestions.noProject'
  | 'gtd.someday'
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
  | 'gtd.focus.title'
  | 'gtd.focus.subtitle'
  | 'gtd.focus.today'
  | 'gtd.focus.upcoming'
  | 'gtd.focus.anytime'
  | 'gtd.focus.empty'
  | 'gtd.engage'
  | 'gtd.engage.subtitle'
  | 'help.title'
  | 'help.subtitle'
  | 'help.intro'
  | 'help.back'
  | 'help.settings'
  | 'help.principles.title'
  | 'help.usage.title'
  | 'help.usage.capture'
  | 'help.usage.organize'
  | 'help.usage.context'
  | 'help.usage.review'
  | 'help.views.title'
  | 'help.widgets.title'
  | 'help.widgets.home.title'
  | 'help.widgets.home.description'
  | 'help.widgets.home.empty'
  | 'help.widgets.lock.title'
  | 'help.widgets.lock.description'
  | 'help.footer'
  | 'gtd.quickCapture.title'
  | 'gtd.quickCapture.subtitle'
  | 'gtd.quickCapture.placeholder'
  | 'gtd.quickCapture.notes'
  | 'gtd.quickCapture.notesHint'
  | 'gtd.quickCapture.when'
  | 'gtd.quickCapture.whenHint'
  | 'gtd.quickCapture.destination'
  | 'gtd.quickCapture.destinationHint'
  | 'gtd.quickCapture.projectPlaceholder'
  | 'gtd.quickCapture.areaPlaceholder'
  | 'gtd.quickCapture.cta'
  | 'gtd.quickCapture.saving'
  | 'gtd.quickCapture.preset.inbox'
  | 'gtd.quickCapture.preset.today'
  | 'gtd.quickCapture.preset.upcoming'
  | 'gtd.quickCapture.preset.anytime'
  | 'gtd.quickCapture.preset.someday'
  | 'gtd.noNotes'
  | 'gtd.markDone'
  | 'gtd.markOpen'
  | 'gtd.empty'
  | 'tasks.empty'
  | 'tasks.empty.filtered'
  | 'tasks.empty.cta'
  | 'tasks.loading'
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
  | 'mobile.nav.home'
  | 'mobile.nav.search'
  | 'mobile.nav.new'
  | 'mobile.nav.newTask'
  | 'mobile.upcoming.addAfterToday'
  | 'mobile.creation.task.title'
  | 'mobile.creation.task.desc'
  | 'mobile.creation.project.title'
  | 'mobile.creation.project.desc'
  | 'mobile.creation.area.title'
  | 'mobile.creation.area.desc'
  | 'view.inbox'
  | 'view.today'
  | 'view.upcoming'
  | 'view.anytime'
  | 'view.waiting'
  | 'view.someday'
  | 'view.reference'
  | 'view.logbook'
  | 'view.search'
  | 'view.desc.inbox'
  | 'view.desc.today'
  | 'view.desc.upcoming'
  | 'view.desc.anytime'
  | 'view.desc.waiting'
  | 'view.desc.someday'
  | 'view.desc.reference'
  | 'view.desc.logbook'
  | 'view.desc.search'
  | 'actions.back'
  | 'actions.close'
  | 'actions.cancel'
  | 'actions.ok'
  | 'actions.showAll'
  | 'actions.hide'
  | 'actions.focusMode'
  | 'actions.showSidebar'
  | 'actions.clear'
  | 'actions.retry'
  | 'actions.add'
  | 'actions.done'
  | 'actions.save'
  | 'actions.rename'
  | 'schedule.title'
  | 'schedule.hint'
  | 'multiSelect.select'
  | 'multiSelect.done'
  | 'multiSelect.selected'
  | 'multiSelect.selectTask'
  | 'multiSelect.deselectTask'
  | 'multiSelect.actions.move'
  | 'multiSelect.actions.complete'
  | 'multiSelect.actions.delete'
  | 'multiSelect.actions.copy'
  | 'multiSelect.actions.share'
  | 'multiSelect.actions.paste'
  | 'agenda.title'
  | 'mobile.search.placeholder'
  | 'datePicker.option.today'
  | 'datePicker.option.tomorrow'
  | 'datePicker.option.weekend'
  | 'datePicker.option.nextWeek'
  | 'datePicker.option.clear'
  | 'datePicker.title.new'
  | 'datePicker.title.edit'
  | 'datePicker.title.draft'
  | 'datePicker.title.deadline.new'
  | 'datePicker.title.deadline.edit'
  | 'datePicker.title.deadline.draft'
  | 'datePicker.none'
  | 'datePicker.prevMonth'
  | 'datePicker.nextMonth'
  | 'datePicker.selected'
  | 'datePicker.noDateAssigned'
  | 'datePicker.hint'
  | 'datePicker.hint.deadline'
  | 'datePicker.apply'
  | 'datePicker.apply.deadline'
  | 'task.menu.title'
  | 'task.menu.pin'
  | 'task.menu.unpin'
  | 'task.menu.duplicate'
  | 'task.menu.copyLink'
  | 'task.edit.title'
  | 'task.edit.titlePlaceholder'
  | 'task.edit.notesPlaceholder'
  | 'task.edit.when'
  | 'task.singular'
  | 'task.plural'
  | 'task.project.none'
  | 'task.section.none'
  | 'task.quickView.title'
  | 'task.loose'
  | 'task.labels'
  | 'task.notes'
  | 'task.checklist'
  | 'task.autoSaveHint'
  | 'task.archive'
  | 'task.move'
  | 'task.convert'
  | 'task.convertedHint'
  | 'task.trash'
  | 'task.created'
  | 'task.createdOn'
  | 'task.move.title'
  | 'task.move.subtitle'
  | 'task.move.section.general'
  | 'task.move.section.unassigned'
  | 'project.new.title'
  | 'project.new.subtitle'
  | 'project.new.placeholder'
  | 'project.new.area.none'
  | 'project.new.area.empty'
  | 'project.new.create'
  | 'project.new.saving'
  | 'labels.title'
  | 'labels.hint'
  | 'labels.empty'
  | 'labels.delete'
  | 'labels.placeholder'

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
    'settings.views.waiting': 'En espera / dependencias',
    'settings.views.someday': 'Algún día, ideas aparcadas',
    'settings.views.reference': 'Referencia y archivo',
    'settings.views.logbook': 'Historial de completadas',
    'settings.completedContexts.title': 'Mostrar completadas en proyectos/áreas',
    'settings.completedContexts.description': 'Incluye una sección “Completadas” en vistas de proyecto y área.',
    'settings.completedContexts.visible': 'Visibles',
    'settings.completedContexts.hidden': 'Ocultas',
    'settings.mobilePreview.title': 'Modo móvil (QA)',
    'settings.mobilePreview.description': 'Fuerza la interfaz móvil desde escritorio sin cambiar el ancho de pantalla.',
    'settings.mobilePreview.enabled': 'Activo',
    'settings.mobilePreview.disabled': 'Inactivo',
    'settings.account': 'Cuenta',
    'settings.accountHint': 'Cerrar sesión y volver a la pantalla de inicio',
    'settings.logout.aria': 'Cerrar sesión',
    'context.label.view': 'Vista',
    'context.label.project': 'Proyecto',
    'context.label.area': 'Área',
    'context.label.section': 'Sección',
    'context.pending': 'Pendientes',
    'context.overdue': 'vencida(s)',
    'filters.all': 'Todo',
    'filters.important': 'Importantes',
    'sidebar.brand': 'Azahar',
    'sidebar.workspace': 'Workspace',
    'sidebar.settings': 'Ajustes',
    'sidebar.help': 'Ayuda',
    'sidebar.logout': 'Salir',
    'sidebar.inProgress': 'En progreso',
    'sidebar.tasks': 'tareas',
    'sidebar.focus': 'Focus',
    'sidebar.areas': 'Áreas',
    'sidebar.projects': 'Proyectos',
    'sidebar.emptyAreas': 'Crea tu primera área para organizarte.',
    'sidebar.newList': 'Nueva lista',
    'sidebar.newProject': 'Nuevo proyecto',
    'sidebar.newProject.desc': 'Define un objetivo y avanza tarea a tarea.',
    'sidebar.newArea': 'Nueva área',
    'sidebar.newArea.desc': 'Agrupa proyectos por responsabilidades.',
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
    'gtd.focus.title': 'Radar de enfoque',
    'gtd.focus.subtitle': 'Una vista reducida de lo que merece tu atención.',
    'gtd.focus.today': 'Hoy / Atrasadas',
    'gtd.focus.upcoming': 'Próximos días',
    'gtd.focus.anytime': 'Sin fecha',
    'gtd.focus.empty': 'Sin tareas aquí. Elige algo del tablero o captura una nueva.',
    'gtd.engage': 'Enganchar',
    'gtd.engage.subtitle': 'Cierra ciclos',
    'help.title': 'Ayuda GTD',
    'help.subtitle': 'GTD + Azahar',
    'help.intro': 'Guía rápida para capturar, decidir y ejecutar sin perder contexto.',
    'help.back': 'Volver a la app',
    'help.settings': 'Ajustes',
    'help.principles.title': 'Los 5 pasos de GTD',
    'help.usage.title': 'Cómo usar Azahar',
    'help.usage.capture': 'Captura todo en Inbox y decide después.',
    'help.usage.organize': 'Organiza en áreas y proyectos con próximos pasos claros.',
    'help.usage.context': 'Etiqueta por contexto para agrupar tareas similares.',
    'help.usage.review': 'Revisa a diario y haz una revisión semanal para mantener el sistema limpio.',
    'help.views.title': 'Vistas rápidas',
    'help.widgets.title': 'Widgets',
    'help.widgets.home.title': 'Widget en Home',
    'help.widgets.home.description': 'Muestra Hoy con contador y lista corta. Un toque abre Hoy.',
    'help.widgets.home.empty': 'Sin tareas para hoy.',
    'help.widgets.lock.title': 'Widget en Lock Screen',
    'help.widgets.lock.description': 'Acceso rápido a Hoy desde la pantalla de bloqueo.',
    'help.footer': 'Azahar mantiene tu sistema ligero: captura rápido, decide con calma.',
    'search.title': 'Búsqueda rápida',
    'search.placeholder': 'Buscar tareas, proyectos, áreas...',
    'search.noResults': 'No se encontraron resultados para',
    'search.navigate': 'Enter para ir',
    'search.type.task': 'Tarea',
    'search.type.project': 'Proyecto',
    'search.type.area': 'Área',
    'search.type.view': 'Vista',
    'search.clear': 'Limpiar',
    'search.suggestions.title': 'Sugerencias',
    'search.suggestions.empty': 'No hay sugerencias',
    'search.suggestions.project': 'Proyecto',
    'search.suggestions.noProject': 'Sin proyecto',
    'gtd.someday': 'Algún día',
    'gtd.quickCapture.title': 'Captura rápida',
    'gtd.quickCapture.subtitle': 'Inspírate en Things: escribe primero, ordena después.',
    'gtd.quickCapture.placeholder': 'Captura en un solo campo: “Enviar briefing a Juan mañana”',
    'gtd.quickCapture.notes': 'Notas rápidas, checklist mental o contexto adicional (opcional)',
    'gtd.quickCapture.notesHint': 'Añade contexto, enlaces o tu checklist mental.',
    'gtd.quickCapture.when': 'Cuándo',
    'gtd.quickCapture.whenHint': 'Usa presets rápidos',
    'gtd.quickCapture.destination': 'Destino',
    'gtd.quickCapture.destinationHint': 'Asigna hogar opcional',
    'gtd.quickCapture.projectPlaceholder': 'Sin proyecto (inbox)',
    'gtd.quickCapture.areaPlaceholder': 'Sin área',
    'gtd.quickCapture.cta': 'Añadir',
    'gtd.quickCapture.saving': 'Guardando...',
    'gtd.quickCapture.preset.inbox': 'Deja que lo revises luego.',
    'gtd.quickCapture.preset.today': 'Para hoy o atrasadas.',
    'gtd.quickCapture.preset.upcoming': 'Planifica para los próximos días.',
    'gtd.quickCapture.preset.anytime': 'Cuando haya tiempo.',
    'gtd.quickCapture.preset.someday': 'Incuba sin presión.',
    'gtd.noNotes': 'Sin notas adicionales',
    'gtd.markDone': 'Marcar como hecha',
    'gtd.markOpen': 'Reabrir',
    'gtd.empty': 'Nada aquí todavía. Respira, prioriza o captura algo nuevo.',
    'tasks.empty': 'No hay tareas todavía. Captura la primera cuando quieras.',
    'tasks.empty.filtered': 'No hay tareas que coincidan con esta vista. Puedes ajustar los filtros cuando quieras.',
    'tasks.empty.cta': 'Crear tarea',
    'tasks.loading': 'Cargando tareas...',
    'gtd.due': 'Fecha límite',
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
    'mobile.nav.home': 'Inicio',
    'mobile.nav.search': 'Buscar',
    'mobile.nav.new': 'Nueva',
    'mobile.nav.newTask': 'Crear nueva tarea',
    'mobile.upcoming.addAfterToday': 'Crear después de hoy',
    'mobile.creation.task.title': 'Nueva tarea',
    'mobile.creation.task.desc': 'Añade rápidamente una tarea a la entrada.',
    'mobile.creation.project.title': 'Nuevo proyecto',
    'mobile.creation.project.desc': 'Define un objetivo y avanza tarea tras tarea.',
    'mobile.creation.area.title': 'Nueva área',
    'mobile.creation.area.desc': 'Agrupa proyectos y tareas por responsabilidades.',
    'view.inbox': 'Entrada',
    'view.today': 'Hoy',
    'view.upcoming': 'Siguientes',
    'view.anytime': 'Cualquier momento',
    'view.waiting': 'En espera',
    'view.someday': 'Algún día',
    'view.reference': 'Referencia',
    'view.logbook': 'Logbook',
    'view.search': 'Buscar',
    'view.desc.inbox': 'Captura ideas y tareas que aún no tienen hogar.',
    'view.desc.today': 'Todo lo que vence hoy y lo que se quedó atrás.',
    'view.desc.upcoming': 'Lo que está planificado para los próximos días y semanas.',
    'view.desc.anytime': 'Tareas sin fecha que podrás programar después.',
    'view.desc.waiting': 'Pendientes de respuesta o dependencias externas.',
    'view.desc.someday': 'Ideas para más adelante, sin presión.',
    'view.desc.reference': 'Material de consulta sin acción inmediata.',
    'view.desc.logbook': 'Un registro de todo lo que has terminado.',
    'view.desc.search': 'Resultados en todas las vistas (completadas sólo si lo tienes activado).',
    'actions.back': 'Volver',
    'actions.close': 'Cerrar',
    'actions.cancel': 'Cancelar',
    'actions.ok': 'OK',
    'actions.showAll': 'Ver todo',
    'actions.hide': 'Ocultar',
    'actions.focusMode': 'Modo foco',
    'actions.showSidebar': 'Mostrar sidebar',
    'actions.clear': 'Limpiar',
    'actions.retry': 'Reintentar',
    'actions.add': 'Añadir',
    'actions.done': 'Listo',
    'actions.save': 'Guardar',
    'actions.rename': 'Renombrar',
    'schedule.title': '¿Cuándo?',
    'schedule.hint': 'Selecciona la vista rápida para agendar.',
    'multiSelect.select': 'Seleccionar',
    'multiSelect.done': 'Listo',
    'multiSelect.selected': 'Seleccionadas',
    'multiSelect.selectTask': 'Seleccionar tarea',
    'multiSelect.deselectTask': 'Deseleccionar tarea',
    'multiSelect.actions.move': 'Mover',
    'multiSelect.actions.complete': 'Completar',
    'multiSelect.actions.delete': 'Eliminar',
    'multiSelect.actions.copy': 'Copiar',
    'multiSelect.actions.share': 'Compartir',
    'multiSelect.actions.paste': 'Pegar',
    'agenda.title': 'Agenda',
    'mobile.search.placeholder': 'Búsqueda rápida',
    'datePicker.option.today': 'Hoy',
    'datePicker.option.tomorrow': 'Mañana',
    'datePicker.option.weekend': 'Este fin',
    'datePicker.option.nextWeek': 'Próxima semana',
    'datePicker.option.clear': 'Sin fecha',
    'datePicker.title.new': 'Cuando para nueva tarea',
    'datePicker.title.edit': 'Actualizar cuando',
    'datePicker.title.draft': 'Cuando',
    'datePicker.title.deadline.new': 'Fecha límite para nueva tarea',
    'datePicker.title.deadline.edit': 'Actualizar fecha límite',
    'datePicker.title.deadline.draft': 'Fecha límite',
    'datePicker.none': 'Sin fecha',
    'datePicker.prevMonth': 'Mes anterior',
    'datePicker.nextMonth': 'Mes siguiente',
    'datePicker.selected': 'Seleccionada',
    'datePicker.noDateAssigned': 'Sin fecha asignada',
    'datePicker.hint': 'Confirma el cuando con el botón aplicar para guardar el cambio.',
    'datePicker.hint.deadline': 'Confirma la fecha límite con el botón aplicar para guardar el cambio.',
    'datePicker.apply': 'Aplicar cuando',
    'datePicker.apply.deadline': 'Aplicar fecha límite',
    'task.menu.title': 'Acciones',
    'task.menu.pin': 'Fijar tarea',
    'task.menu.unpin': 'Quitar fijado',
    'task.menu.duplicate': 'Duplicar tarea',
    'task.menu.copyLink': 'Copiar enlace',
    'task.edit.title': 'Editar tarea',
    'task.edit.titlePlaceholder': 'Título',
    'task.edit.notesPlaceholder': 'Notas (Markdown)',
    'task.edit.when': 'Cuando',
    'task.singular': 'tarea',
    'task.plural': 'tareas',
    'task.project.none': 'Sin proyecto',
    'task.section.none': 'Sin sección',
    'task.quickView.title': 'Mover a',
    'task.loose': 'Tareas sueltas',
    'task.labels': 'Etiquetas',
    'task.notes': 'Notas',
    'task.checklist': 'Checklist',
    'task.autoSaveHint': 'Los cambios se guardan automáticamente al salir.',
    'task.archive': 'Archivar',
    'task.move': 'Mover',
    'task.convert': 'Convertir en proyecto',
    'task.convertedHint': 'Ya pertenece a un proyecto',
    'task.trash': 'Papelera',
    'task.created': 'Creada',
    'task.createdOn': 'Creada el',
    'task.move.title': 'Mover tarea',
    'task.move.subtitle': 'Selecciona destino',
    'task.move.section.general': 'General',
    'task.move.section.unassigned': 'Proyectos sin área',
    'project.new.title': 'Nuevo proyecto',
    'project.new.subtitle': 'Da forma a un objetivo',
    'project.new.placeholder': 'Nombre del proyecto',
    'project.new.area.none': 'Sin área',
    'project.new.area.empty': 'No hay áreas disponibles todavía.',
    'project.new.create': 'Crear proyecto',
    'project.new.saving': 'Guardando...',
    'labels.title': 'Etiquetas',
    'labels.hint': 'Selecciona o crea etiquetas sin perder el foco.',
    'labels.empty': 'Aún no tienes etiquetas.',
    'labels.delete': 'Eliminar',
    'labels.placeholder': 'Nueva etiqueta',
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
    'settings.views.waiting': 'Waiting for / dependencies',
    'settings.views.someday': 'Someday, parked ideas',
    'settings.views.reference': 'Reference and archive',
    'settings.views.logbook': 'History of done tasks',
    'settings.completedContexts.title': 'Show completed in projects/areas',
    'settings.completedContexts.description': 'Adds a “Completed” section in project and area views.',
    'settings.completedContexts.visible': 'Visible',
    'settings.completedContexts.hidden': 'Hidden',
    'settings.mobilePreview.title': 'Mobile mode (QA)',
    'settings.mobilePreview.description': 'Forces the mobile interface on desktop without changing the viewport width.',
    'settings.mobilePreview.enabled': 'Enabled',
    'settings.mobilePreview.disabled': 'Disabled',
    'settings.account': 'Account',
    'settings.accountHint': 'Log out and return to the start screen',
    'settings.logout.aria': 'Log out',
    'context.label.view': 'View',
    'context.label.project': 'Project',
    'context.label.area': 'Area',
    'context.label.section': 'Section',
    'context.pending': 'Pending',
    'context.overdue': 'overdue',
    'filters.all': 'All',
    'filters.important': 'Important',
    'sidebar.brand': 'Azahar',
    'sidebar.workspace': 'Workspace',
    'sidebar.settings': 'Settings',
    'sidebar.help': 'Help',
    'sidebar.logout': 'Log out',
    'sidebar.inProgress': 'In progress',
    'sidebar.tasks': 'tasks',
    'sidebar.focus': 'Focus',
    'sidebar.areas': 'Areas',
    'sidebar.projects': 'Projects',
    'sidebar.emptyAreas': 'Create your first area to organize your work.',
    'sidebar.newList': 'New list',
    'sidebar.newProject': 'New project',
    'sidebar.newProject.desc': 'Define a goal and move forward task by task.',
    'sidebar.newArea': 'New area',
    'sidebar.newArea.desc': 'Group projects by responsibility.',
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
    'gtd.focus.title': 'Focus radar',
    'gtd.focus.subtitle': 'A compact glance at what deserves attention.',
    'gtd.focus.today': 'Today / Overdue',
    'gtd.focus.upcoming': 'Next days',
    'gtd.focus.anytime': 'Anytime',
    'gtd.focus.empty': 'Nothing here. Pick from the board or capture something new.',
    'gtd.engage': 'Engage',
    'gtd.engage.subtitle': 'Close loops',
    'help.title': 'GTD Help',
    'help.subtitle': 'GTD + Azahar',
    'help.intro': 'A quick guide to capture, clarify, and execute without losing context.',
    'help.back': 'Back to app',
    'help.settings': 'Settings',
    'help.principles.title': 'The 5 steps of GTD',
    'help.usage.title': 'How to use Azahar',
    'help.usage.capture': 'Capture everything in Inbox and decide later.',
    'help.usage.organize': 'Organize into areas and projects with clear next actions.',
    'help.usage.context': 'Use labels for context to batch similar tasks.',
    'help.usage.review': 'Review daily and run a weekly review to keep the system clean.',
    'help.views.title': 'Quick views',
    'help.widgets.title': 'Widgets',
    'help.widgets.home.title': 'Home widget',
    'help.widgets.home.description': 'Shows Today with count and a short list. Tap to open Today.',
    'help.widgets.home.empty': 'No tasks for today yet.',
    'help.widgets.lock.title': 'Lock screen widget',
    'help.widgets.lock.description': 'Quick access to Today from the lock screen.',
    'help.footer': 'Azahar keeps your system light: capture fast, decide calmly.',
    'search.title': 'Quick Find',
    'search.placeholder': 'Search tasks, projects, areas...',
    'search.noResults': 'No results found for',
    'search.navigate': 'Press Enter to go',
    'search.type.task': 'Task',
    'search.type.project': 'Project',
    'search.type.area': 'Area',
    'search.type.view': 'View',
    'search.clear': 'Clear',
    'search.suggestions.title': 'Suggestions',
    'search.suggestions.empty': 'No suggestions',
    'search.suggestions.project': 'Project',
    'search.suggestions.noProject': 'No project',
    'gtd.someday': 'Someday',
    'gtd.quickCapture.title': 'Quick capture',
    'gtd.quickCapture.subtitle': 'Inspired by Things: write first, sort later.',
    'gtd.quickCapture.placeholder': 'Capture in one field: “Send briefing to Sarah tomorrow”',
    'gtd.quickCapture.notes': 'Quick notes, mental checklist, or extra context (optional)',
    'gtd.quickCapture.notesHint': 'Add context, links, or your mental checklist.',
    'gtd.quickCapture.when': 'When',
    'gtd.quickCapture.whenHint': 'Use quick presets',
    'gtd.quickCapture.destination': 'Destination',
    'gtd.quickCapture.destinationHint': 'Optional home',
    'gtd.quickCapture.projectPlaceholder': 'No project (inbox)',
    'gtd.quickCapture.areaPlaceholder': 'No area',
    'gtd.quickCapture.cta': 'Add',
    'gtd.quickCapture.saving': 'Saving...',
    'gtd.quickCapture.preset.inbox': 'Leave it to clarify later.',
    'gtd.quickCapture.preset.today': 'For today or overdue.',
    'gtd.quickCapture.preset.upcoming': 'Plan for the next days.',
    'gtd.quickCapture.preset.anytime': 'Whenever you find time.',
    'gtd.quickCapture.preset.someday': 'Incubate without pressure.',
    'gtd.noNotes': 'No extra notes',
    'gtd.markDone': 'Mark done',
    'gtd.markOpen': 'Reopen',
    'gtd.empty': 'Nothing here yet. Breathe, prioritize, or capture something new.',
    'tasks.empty': 'No tasks yet. Capture the first one whenever you are ready.',
    'tasks.empty.filtered': 'No tasks match this view. You can adjust the filters anytime.',
    'tasks.empty.cta': 'Create task',
    'tasks.loading': 'Loading tasks...',
    'gtd.due': 'Deadline',
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
    'mobile.nav.home': 'Home',
    'mobile.nav.search': 'Search',
    'mobile.nav.new': 'New',
    'mobile.nav.newTask': 'Create new task',
    'mobile.upcoming.addAfterToday': 'Create after today',
    'mobile.creation.task.title': 'New task',
    'mobile.creation.task.desc': 'Quickly capture a task in the inbox.',
    'mobile.creation.project.title': 'New project',
    'mobile.creation.project.desc': 'Define a goal and move it forward task by task.',
    'mobile.creation.area.title': 'New area',
    'mobile.creation.area.desc': 'Group projects and tasks by responsibility.',
    'view.inbox': 'Inbox',
    'view.today': 'Today',
    'view.upcoming': 'Upcoming',
    'view.anytime': 'Anytime',
    'view.waiting': 'Waiting',
    'view.someday': 'Someday',
    'view.reference': 'Reference',
    'view.logbook': 'Logbook',
    'view.search': 'Search',
    'view.desc.inbox': 'Capture ideas and tasks that still need a home.',
    'view.desc.today': 'Everything due today plus anything that slipped through.',
    'view.desc.upcoming': 'What is planned for the next days and weeks.',
    'view.desc.anytime': 'Tasks without a date live here until you schedule them.',
    'view.desc.waiting': 'Waiting on replies or external dependencies.',
    'view.desc.someday': 'A parking lot for ideas you want to revisit later.',
    'view.desc.reference': 'Reference material with no immediate action.',
    'view.desc.logbook': 'A record of everything you have finished.',
    'view.desc.search': 'Results across all lists (done items only if enabled).',
    'actions.back': 'Back',
    'actions.close': 'Close',
    'actions.cancel': 'Cancel',
    'actions.ok': 'OK',
    'actions.showAll': 'Show all',
    'actions.hide': 'Hide',
    'actions.focusMode': 'Focus mode',
    'actions.showSidebar': 'Show sidebar',
    'actions.clear': 'Clear',
    'actions.retry': 'Retry',
    'actions.add': 'Add',
    'actions.done': 'Done',
    'actions.save': 'Save',
    'actions.rename': 'Rename',
    'schedule.title': 'When?',
    'schedule.hint': 'Pick the view to schedule.',
    'multiSelect.select': 'Select',
    'multiSelect.done': 'Done',
    'multiSelect.selected': 'Selected',
    'multiSelect.selectTask': 'Select task',
    'multiSelect.deselectTask': 'Deselect task',
    'multiSelect.actions.move': 'Move',
    'multiSelect.actions.complete': 'Complete',
    'multiSelect.actions.delete': 'Delete',
    'multiSelect.actions.copy': 'Copy',
    'multiSelect.actions.share': 'Share',
    'multiSelect.actions.paste': 'Paste',
    'agenda.title': 'Agenda',
    'mobile.search.placeholder': 'Quick search',
    'datePicker.option.today': 'Today',
    'datePicker.option.tomorrow': 'Tomorrow',
    'datePicker.option.weekend': 'This weekend',
    'datePicker.option.nextWeek': 'Next week',
    'datePicker.option.clear': 'No date',
    'datePicker.title.new': 'When for new task',
    'datePicker.title.edit': 'Update when',
    'datePicker.title.draft': 'When',
    'datePicker.title.deadline.new': 'Deadline for new task',
    'datePicker.title.deadline.edit': 'Update deadline',
    'datePicker.title.deadline.draft': 'Deadline',
    'datePicker.none': 'No date',
    'datePicker.prevMonth': 'Previous month',
    'datePicker.nextMonth': 'Next month',
    'datePicker.selected': 'Selected',
    'datePicker.noDateAssigned': 'No date assigned',
    'datePicker.hint': 'Confirm the when with the apply button to save the change.',
    'datePicker.hint.deadline': 'Confirm the deadline with the apply button to save the change.',
    'datePicker.apply': 'Apply when',
    'datePicker.apply.deadline': 'Apply deadline',
    'task.menu.title': 'Actions',
    'task.menu.pin': 'Pin task',
    'task.menu.unpin': 'Unpin task',
    'task.menu.duplicate': 'Duplicate task',
    'task.menu.copyLink': 'Copy link',
    'task.edit.title': 'Edit task',
    'task.edit.titlePlaceholder': 'Title',
    'task.edit.notesPlaceholder': 'Notes (Markdown)',
    'task.edit.when': 'When',
    'task.singular': 'task',
    'task.plural': 'tasks',
    'task.project.none': 'No project',
    'task.section.none': 'No section',
    'task.quickView.title': 'Move to',
    'task.loose': 'Loose tasks',
    'task.labels': 'Labels',
    'task.notes': 'Notes',
    'task.checklist': 'Checklist',
    'task.autoSaveHint': 'Changes save automatically when you leave.',
    'task.archive': 'Archive',
    'task.move': 'Move',
    'task.convert': 'Convert to project',
    'task.convertedHint': 'Already belongs to a project',
    'task.trash': 'Trash',
    'task.created': 'Created',
    'task.createdOn': 'Created on',
    'task.move.title': 'Move task',
    'task.move.subtitle': 'Select destination',
    'task.move.section.general': 'General',
    'task.move.section.unassigned': 'Projects without area',
    'project.new.title': 'New project',
    'project.new.subtitle': 'Shape a goal',
    'project.new.placeholder': 'Project name',
    'project.new.area.none': 'No area',
    'project.new.area.empty': 'No areas available yet.',
    'project.new.create': 'Create project',
    'project.new.saving': 'Saving...',
    'labels.title': 'Labels',
    'labels.hint': 'Select or create labels without losing focus.',
    'labels.empty': 'No labels yet.',
    'labels.delete': 'Delete',
    'labels.placeholder': 'New label',
  },
}

export const translate = (lang: Language, key: TranslationKey) => translations[lang][key] ?? key
