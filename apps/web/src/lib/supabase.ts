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
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, tasks: data as Task[] }
  } catch (err) {
    return { success: false, error: 'Error al obtener tareas' }
  }
}

export async function addTask(title: string): Promise<{ success: boolean; task?: Task; error?: string }> {
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
        status: 'open'
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
