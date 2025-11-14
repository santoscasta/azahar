import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan variables de entorno VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos y funciones de autenticación
export async function signUp(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    return { success: false, error: 'Error inesperado en registro' }
  }
}

export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
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
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Funciones de tareas
export interface TaskLabelSummary {
  id: string
  name: string
  color: string | null
}

export interface Task {
  id: string
  user_id: string
  project_id: string | null
  title: string
  notes: string | null
  status: 'open' | 'done' | 'snoozed'
  priority: number
  due_at: string | null
  start_at: string | null
  repeat_rrule: string | null
  reminder_at: string | null
  updated_at: string
  created_at: string
  completed_at: string | null
  labels?: TaskLabelSummary[]
}

export interface Project {
  id: string
  user_id: string
  name: string
  color: string | null
  sort_order: number
  created_at: string
}

export interface Label {
  id: string
  user_id: string
  name: string
  color: string | null
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

export async function searchTasks(
  query?: string,
  projectId?: string,
  labelIds?: string[]
): Promise<{ success: boolean; tasks?: Task[]; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    // Obtener todas las tareas del usuario
    const { data: allTasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        *,
        task_labels:task_labels (
          label_id,
          labels (
            id,
            name,
            color
          )
        )
      `)
      .eq('user_id', user.id)
      .order('due_at', { ascending: true, nullsFirst: true })
      .order('created_at', { ascending: false })

    if (tasksError) {
      return { success: false, error: tasksError.message }
    }

    const tasksWithLabels =
      (allTasks || []).map(task => {
        const taskLabels = (task as any).task_labels as Array<{ labels: Label | null }> | undefined
        const summaries =
          taskLabels
            ?.map(item => item.labels)
            .filter(Boolean)
            .map(label => ({
              id: label!.id,
              name: label!.name,
              color: label!.color,
            })) || []
        const { task_labels, ...rest } = task as any
        return {
          ...(rest as Task),
          labels: summaries,
        }
      }) || []

    let filtered = tasksWithLabels

    // Filtrar por proyecto
    if (projectId) {
      filtered = filtered.filter(t => t.project_id === projectId)
    }

    // Filtrar por búsqueda de texto (title + notes)
    if (query && query.trim()) {
      const q = query.toLowerCase()
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q))
      )
    }

    // Filtrar por etiquetas (si hay etiquetas seleccionadas, la tarea debe tener TODAS)
    if (labelIds && labelIds.length > 0) {
      filtered = filtered.filter(t => {
        const labelSet = new Set((t.labels || []).map(label => label.id))
        return labelIds.every(labelId => labelSet.has(labelId))
      })
    }

    return { success: true, tasks: filtered }
  } catch (err) {
    return { success: false, error: 'Error al buscar tareas' }
  }
}

export async function addTask(
  title: string,
  notes?: string,
  priority?: number,
  due_at?: string,
  status: 'open' | 'done' | 'snoozed' = 'open',
  project_id?: string | null
): Promise<{ success: boolean; task?: Task; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    if (!title.trim()) {
      return { success: false, error: 'El título no puede estar vacío' }
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: title.trim(),
        notes: notes || null,
        priority: priority || 0,
        due_at: due_at || null,
        status: status || 'open',
        project_id: project_id || null
      })
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

export async function addProject(name: string, color: string = '#3b82f6'): Promise<{ success: boolean; project?: Project; error?: string }> {
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
        sort_order: 0
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

export async function updateProject(id: string, updates: Partial<Project>): Promise<{ success: boolean; project?: Project; error?: string }> {
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
