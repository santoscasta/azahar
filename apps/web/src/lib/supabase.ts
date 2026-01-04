import { createClient } from '@supabase/supabase-js'

type RuntimeEnv = Record<string, string | undefined>

const runtimeEnv: RuntimeEnv | undefined =
  (import.meta as ImportMeta & { env?: RuntimeEnv }).env ??
  ((globalThis as { process?: { env?: RuntimeEnv } }).process?.env ?? undefined)

const supabaseUrl = runtimeEnv?.VITE_SUPABASE_URL
const supabaseKey = runtimeEnv?.VITE_SUPABASE_ANON_KEY
const appBaseUrl = runtimeEnv?.VITE_APP_BASE_URL
const appMode = runtimeEnv?.MODE ?? runtimeEnv?.NODE_ENV
const isTestEnv = appMode === 'test' || appMode === 'vitest'
const bypassE2E = runtimeEnv?.VITE_E2E_BYPASS_AUTH === 'true' && isTestEnv
const enableMutationIds = runtimeEnv?.VITE_ENABLE_MUTATION_IDS === 'true'

const hasSupabaseCreds = Boolean(supabaseUrl && supabaseKey)
type MaybeNodeProcess = { versions?: { node?: string } }
const nodeProcess = (globalThis as { process?: MaybeNodeProcess }).process
const runningInNode = !!nodeProcess?.versions?.node
const allowPlaceholderClient = runningInNode && isTestEnv

if (!hasSupabaseCreds && !allowPlaceholderClient) {
  throw new Error('Faltan variables de entorno VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseKey ?? 'public-anon-key'
)

const getRedirectUrl = (path: string) => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`
  }
  if (appBaseUrl) {
    return `${appBaseUrl}${path}`
  }
  return `http://localhost:5173${path}`
}

// Tipos y funciones de autenticación
export interface AuthResult {
  success: boolean
  error?: string
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  if (bypassE2E) {
    return { success: true }
  }
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getRedirectUrl('/app'),
      },
    })
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    return { success: false, error: 'Error inesperado en registro' }
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (bypassE2E) {
    return { success: true }
  }
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    return { success: false, error: 'Error inesperado en login' }
  }
}

export async function signOut(): Promise<{ success: boolean; error?: string }> {
  if (bypassE2E) {
    return { success: true }
  }
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    return { success: false, error: 'Error al cerrar sesión' }
  }
}

export async function getCurrentUser() {
  if (bypassE2E) {
    return { id: 'e2e-user' }
  }
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Funciones de tareas
export interface TaskLabelSummary {
  id: string
  name: string
  color: string | null
}

export interface TaskChecklistItem {
  id: string
  task_id: string
  user_id: string
  text: string
  completed: boolean
  sort_order: number
  created_at: string
}

export type TaskQuickView = 'inbox' | 'today' | 'upcoming' | 'anytime' | 'waiting' | 'someday' | 'reference' | 'logbook'

export interface Task {
  id: string
  user_id: string
  project_id: string | null
  area_id: string | null
  heading_id: string | null
  title: string
  notes: string | null
  status: 'open' | 'done' | 'snoozed'
  due_at: string | null
  deadline_at: string | null
  start_at: string | null
  repeat_rrule: string | null
  reminder_at: string | null
  updated_at: string
  created_at: string
  completed_at: string | null
  pinned: boolean | null
  sort_orders?: Record<string, number> | null
  client_mutation_id?: string | null
  labels?: TaskLabelSummary[]
  checklist_items?: TaskChecklistItem[]
  quick_view?: TaskQuickView
}

export interface Project {
  id: string
  user_id: string
  name: string
  color: string | null
  sort_order: number
  created_at: string
  area_id: string | null
}

export interface Label {
  id: string
  user_id: string
  name: string
  color: string | null
}

export interface Area {
  id: string
  user_id: string
  name: string
  sort_order: number
  created_at: string
}

export interface ProjectHeading {
  id: string
  project_id: string
  user_id: string
  name: string
  sort_order: number
  created_at: string
}

export interface TaskLabel {
  task_id: string
  label_id: string
}

export async function listTasks(): Promise<{ success: boolean; tasks?: Task[]; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('due_at', { ascending: true, nullsFirst: true })
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, tasks: data as Task[] }
  } catch (err) {
    return { success: false, error: 'Error al obtener tareas' }
  }
}

export interface SearchTasksArgs {
  query?: string | null
  projectId?: string | null
  labelIds?: string[] | null
  areaId?: string | null
  quickView?: TaskQuickView | null
}

type SearchTasksRow = Task & {
  quick_view?: TaskQuickView
  labels?: TaskLabelSummary[]
  checklist_items?: TaskChecklistItem[]
}

export async function searchTasks(args: SearchTasksArgs = {}): Promise<{ success: boolean; tasks?: Task[]; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    if (bypassE2E) {
      const mockTasks: Task[] = [
        {
          id: 'e2e-task',
          user_id: typeof user === 'object' && user ? (user as { id: string }).id : 'e2e-user',
          project_id: null,
          area_id: null,
          heading_id: null,
          title: 'Tarea demo e2e',
          notes: null,
          status: 'open',
          due_at: null,
          deadline_at: null,
          start_at: null,
          repeat_rrule: null,
          reminder_at: null,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          completed_at: null,
          pinned: false,
          sort_orders: {},
          labels: [],
          checklist_items: [],
          quick_view: 'inbox',
          client_mutation_id: null,
        },
      ]
      return { success: true, tasks: mockTasks }
    }

    const { query, projectId, labelIds, areaId, quickView } = args
    const { data, error } = await supabase.rpc('search_tasks', {
      p_query: query ?? null,
      p_project_id: projectId ?? null,
      p_label_ids: labelIds && labelIds.length > 0 ? labelIds : null,
      p_area_id: areaId ?? null,
      p_quick_view: quickView ?? null,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    const tasks = (data as SearchTasksRow[] | null | undefined)?.map((task) => ({
      ...task,
      title: typeof task.title === 'string' ? task.title : '',
      labels: task.labels ?? [],
      checklist_items: task.checklist_items ?? [],
    })) as Task[]

    return { success: true, tasks }
  } catch (err) {
    return { success: false, error: 'Error al buscar tareas' }
  }
}

export async function addTask(
  title: string,
  notes?: string,
  due_at?: string,
  status: 'open' | 'done' | 'snoozed' = 'open',
  project_id?: string | null,
  area_id?: string | null,
  heading_id?: string | null,
  client_mutation_id?: string,
  quick_view?: TaskQuickView,
  deadline_at?: string | null,
  sort_orders?: Record<string, number> | null
): Promise<{ success: boolean; task?: Task; error?: string }> {
  try {
    if (bypassE2E) {
      return {
        success: true,
        task: {
          id: `e2e-${Math.random().toString(36).slice(2)}`,
          user_id: 'e2e-user',
          project_id: project_id || null,
          area_id: area_id || null,
          heading_id: heading_id || null,
          title: title.trim(),
          notes: notes || null,
          status,
          due_at: due_at || null,
          deadline_at: deadline_at || null,
          client_mutation_id: enableMutationIds ? client_mutation_id || null : undefined,
          start_at: null,
          repeat_rrule: null,
          reminder_at: null,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          completed_at: status === 'done' ? new Date().toISOString() : null,
          pinned: false,
          sort_orders: sort_orders ?? {},
          quick_view: quick_view ?? undefined,
        },
      }
    }
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    if (!title.trim()) {
      return { success: false, error: 'El título no puede estar vacío' }
    }

    const insertPayload: Record<string, unknown> = {
      user_id: user.id,
      title: title.trim(),
      notes: notes || null,
      due_at: due_at || null,
      deadline_at: deadline_at || null,
      status: status || 'open',
      project_id: project_id || null,
      area_id: area_id || null,
      heading_id: heading_id || null,
    }

    if (quick_view) {
      insertPayload.quick_view = quick_view
    }

    if (sort_orders) {
      insertPayload.sort_orders = sort_orders
    }

    if (enableMutationIds && client_mutation_id) {
      insertPayload.client_mutation_id = client_mutation_id
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, task: data as Task }
  } catch (err) {
    return { success: false, error: 'Error al crear tarea' }
  }
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<{ success: boolean; task?: Task; error?: string }> {
  try {
    if (bypassE2E) {
      return {
        success: true,
        task: {
          id,
          user_id: 'e2e-user',
          project_id: updates.project_id ?? null,
          area_id: updates.area_id ?? null,
          heading_id: updates.heading_id ?? null,
          title: updates.title ?? 'Actualizada',
          notes: updates.notes ?? null,
          status: updates.status ?? 'open',
          due_at: updates.due_at ?? null,
          deadline_at: updates.deadline_at ?? null,
          start_at: updates.start_at ?? null,
          repeat_rrule: updates.repeat_rrule ?? null,
          reminder_at: updates.reminder_at ?? null,
          updated_at: new Date().toISOString(),
          created_at: updates.created_at ?? new Date().toISOString(),
          completed_at: updates.completed_at ?? null,
          pinned: updates.pinned ?? false,
          sort_orders: updates.sort_orders ?? {},
          labels: [],
          checklist_items: [],
        },
      }
    }
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, task: data as Task }
  } catch (err) {
    return { success: false, error: 'Error al actualizar tarea' }
  }
}

export async function toggleTaskStatus(id: string): Promise<{ success: boolean; task?: Task; error?: string }> {
  try {
    if (bypassE2E) {
      return {
        success: true,
        task: {
          id,
          user_id: 'e2e-user',
          project_id: null,
          area_id: null,
          heading_id: null,
          title: 'Tarea demo e2e',
          notes: null,
          status: 'done',
          due_at: null,
          deadline_at: null,
          start_at: null,
          repeat_rrule: null,
          reminder_at: null,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          pinned: false,
          sort_orders: {},
        },
      }
    }
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    // Obtener estado actual de la tarea
    const { data: currentTask, error: fetchError } = await supabase
      .from('tasks')
      .select('status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !currentTask) {
      return { success: false, error: 'Tarea no encontrada' }
    }

    const newStatus = currentTask.status === 'done' ? 'open' : 'done'
    const completedAt = newStatus === 'done' ? new Date().toISOString() : null

    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        completed_at: completedAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, task: data as Task }
  } catch (err) {
    return { success: false, error: 'Error al cambiar estado de tarea' }
  }
}

export async function deleteTask(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (bypassE2E) {
      return { success: true }
    }
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: 'Error al eliminar tarea' }
  }
}

// Funciones de áreas
export async function getAreas(): Promise<{ success: boolean; areas?: Area[]; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, areas: data as Area[] }
  } catch (err) {
    return { success: false, error: 'Error al obtener áreas' }
  }
}

export async function addArea(name: string): Promise<{ success: boolean; area?: Area; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }
    if (!name.trim()) {
      return { success: false, error: 'El nombre del área no puede estar vacío' }
    }

    const { data, error } = await supabase
      .from('areas')
      .insert({
        user_id: user.id,
        name: name.trim(),
        sort_order: 0,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, area: data as Area }
  } catch (err) {
    return { success: false, error: 'Error al crear área' }
  }
}

export async function updateArea(
  areaId: string,
  updates: { name?: string; sort_order?: number }
): Promise<{ success: boolean; area?: Area; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const { data, error } = await supabase
      .from('areas')
      .update(updates)
      .eq('id', areaId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, area: data as Area }
  } catch (err) {
    return { success: false, error: 'Error al actualizar área' }
  }
}

export async function deleteArea(areaId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const { error } = await supabase.from('areas').delete().eq('id', areaId).eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: 'Error al eliminar área' }
  }
}

// Funciones de proyectos
export async function getProjects(): Promise<{ success: boolean; projects?: Project[]; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, projects: data as Project[] }
  } catch (err) {
    return { success: false, error: 'Error al obtener proyectos' }
  }
}

export async function addProject(
  name: string,
  color: string = '#3b82f6',
  areaId?: string | null
): Promise<{ success: boolean; project?: Project; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    if (!name.trim()) {
      return { success: false, error: 'El nombre del proyecto no puede estar vacío' }
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: name.trim(),
        color,
        sort_order: 0,
        area_id: areaId || null,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, project: data as Project }
  } catch (err) {
    return { success: false, error: 'Error al crear proyecto' }
  }
}

export async function updateProject(
  id: string,
  updates: Partial<Project>
): Promise<{ success: boolean; project?: Project; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, project: data as Project }
  } catch (err) {
    return { success: false, error: 'Error al actualizar proyecto' }
  }
}

export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: 'Error al eliminar proyecto' }
  }
}

// Funciones de headings de proyectos
export async function getProjectHeadings(): Promise<{ success: boolean; headings?: ProjectHeading[]; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const { data, error } = await supabase
      .from('project_headings')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, headings: data as ProjectHeading[] }
  } catch (err) {
    return { success: false, error: 'Error al obtener headings' }
  }
}

export async function addProjectHeading(
  projectId: string,
  name: string
): Promise<{ success: boolean; heading?: ProjectHeading; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }
    if (!name.trim()) {
      return { success: false, error: 'El título del heading no puede estar vacío' }
    }

    const { data, error } = await supabase
      .from('project_headings')
      .insert({
        user_id: user.id,
        project_id: projectId,
        name: name.trim(),
        sort_order: 0,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, heading: data as ProjectHeading }
  } catch (err) {
    return { success: false, error: 'Error al crear heading' }
  }
}

export async function updateProjectHeading(
  headingId: string,
  updates: { name?: string; sort_order?: number }
): Promise<{ success: boolean; heading?: ProjectHeading; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const { data, error } = await supabase
      .from('project_headings')
      .update(updates)
      .eq('id', headingId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, heading: data as ProjectHeading }
  } catch (err) {
    return { success: false, error: 'Error al actualizar heading' }
  }
}

export async function deleteProjectHeading(headingId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const { error } = await supabase
      .from('project_headings')
      .delete()
      .eq('id', headingId)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: 'Error al eliminar heading' }
  }
}

// Funciones de etiquetas
export async function getLabels(): Promise<{ success: boolean; labels?: Label[]; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, labels: data as Label[] }
  } catch (err) {
    return { success: false, error: 'Error al obtener etiquetas' }
  }
}

export async function addLabel(name: string, color: string = '#ec4899'): Promise<{ success: boolean; label?: Label; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    if (!name.trim()) {
      return { success: false, error: 'El nombre de la etiqueta no puede estar vacío' }
    }

    const { data, error } = await supabase
      .from('labels')
      .insert({
        user_id: user.id,
        name: name.trim(),
        color
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, label: data as Label }
  } catch (err) {
    return { success: false, error: 'Error al crear etiqueta' }
  }
}

export async function updateLabel(id: string, updates: Partial<Label>): Promise<{ success: boolean; label?: Label; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const { data, error } = await supabase
      .from('labels')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, label: data as Label }
  } catch (err) {
    return { success: false, error: 'Error al actualizar etiqueta' }
  }
}

export async function deleteLabel(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const { error } = await supabase
      .from('labels')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: 'Error al eliminar etiqueta' }
  }
}

// Funciones de relaciones tarea-etiqueta
export async function getTaskLabels(taskId: string): Promise<{ success: boolean; labels?: Label[]; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const { data, error } = await supabase
      .from('task_labels')
      .select('labels(*)')
      .eq('task_id', taskId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Extraer las etiquetas del resultado
    const labels = (data as any[])?.map(item => item.labels).filter(Boolean) as Label[] || []
    return { success: true, labels }
  } catch (err) {
    return { success: false, error: 'Error al obtener etiquetas de tarea' }
  }
}

export async function addTaskLabel(taskId: string, labelId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    // Verificar que la tarea pertenece al usuario
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('user_id')
      .eq('id', taskId)
      .single()

    if (taskError || !task || task.user_id !== user.id) {
      return { success: false, error: 'Tarea no encontrada' }
    }

    // Verificar que la etiqueta pertenece al usuario
    const { data: label, error: labelError } = await supabase
      .from('labels')
      .select('user_id')
      .eq('id', labelId)
      .single()

    if (labelError || !label || label.user_id !== user.id) {
      return { success: false, error: 'Etiqueta no encontrada' }
    }

    const { error } = await supabase
      .from('task_labels')
      .insert({ task_id: taskId, label_id: labelId })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: 'Error al agregar etiqueta a tarea' }
  }
}

export async function removeTaskLabel(taskId: string, labelId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    // Verificar que la tarea pertenece al usuario
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('user_id')
      .eq('id', taskId)
      .single()

    if (taskError || !task || task.user_id !== user.id) {
      return { success: false, error: 'Tarea no encontrada' }
    }

    const { error } = await supabase
      .from('task_labels')
      .delete()
      .eq('task_id', taskId)
      .eq('label_id', labelId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: 'Error al remover etiqueta de tarea' }
  }
}

export interface ChecklistItemInput {
  id?: string
  text: string
  completed: boolean
  sort_order?: number
}

export async function syncTaskChecklist(
  taskId: string,
  items: ChecklistItemInput[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const deleteResult = await supabase
      .from('task_checklist_items')
      .delete()
      .eq('task_id', taskId)
      .eq('user_id', user.id)

    if (deleteResult.error) {
      return { success: false, error: deleteResult.error.message }
    }

    if (items.length === 0) {
      return { success: true }
    }

    const payload = items.map((item, index) => ({
      user_id: user.id,
      task_id: taskId,
      text: item.text,
      completed: item.completed,
      sort_order: item.sort_order ?? index,
      ...(item.id ? { id: item.id } : {}),
    }))

    const insertResult = await supabase.from('task_checklist_items').insert(payload)
    if (insertResult.error) {
      return { success: false, error: insertResult.error.message }
    }
    return { success: true }
  } catch (err) {
    return { success: false, error: 'Error inesperado al sincronizar checklist' }
  }
}

export async function setTaskPinned(taskId: string, pinned: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }
    const { error } = await supabase
      .from('tasks')
      .update({ pinned, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .eq('user_id', user.id)
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    return { success: false, error: 'Error inesperado al fijar tarea' }
  }
}

export async function toggleChecklistItemCompletion(
  itemId: string,
  completed: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const { error } = await supabase
      .from('task_checklist_items')
      .update({ completed, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    return { success: false, error: 'Error al actualizar checklist' }
  }
}
