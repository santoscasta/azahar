import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { listTasks, addTask, signOut, type Task, updateTask, toggleTaskStatus, deleteTask } from '../lib/supabase'

export default function TasksPage() {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Consulta para obtener tareas
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const result = await listTasks()
      if (!result.success) {
        setError(result.error || 'Error al cargar tareas')
        return []
      }
      return result.tasks || []
    },
  })

  // Mutación para agregar tarea
  const addTaskMutation = useMutation({
    mutationFn: (title: string) => addTask(title),
    onSuccess: (result) => {
      if (result.success) {
        setNewTaskTitle('')
        setError('')
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al crear tarea')
      }
    },
    onError: () => {
      setError('Error inesperado al crear tarea')
    },
  })

  // Mutación para actualizar tarea
  const updateTaskMutation = useMutation({
    mutationFn: (taskId: string) => updateTask(taskId, { title: editingTitle }),
    onSuccess: (result) => {
      if (result.success) {
        setEditingId(null)
        setEditingTitle('')
        setError('')
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al actualizar tarea')
      }
    },
    onError: () => {
      setError('Error inesperado al actualizar tarea')
    },
  })

  // Mutación para cambiar estado de tarea
  const toggleTaskMutation = useMutation({
    mutationFn: (taskId: string) => toggleTaskStatus(taskId),
    onSuccess: (result) => {
      if (result.success) {
        setError('')
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al cambiar estado')
      }
    },
    onError: () => {
      setError('Error inesperado al cambiar estado')
    },
  })

  // Mutación para eliminar tarea
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: (result) => {
      if (result.success) {
        setError('')
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al eliminar tarea')
      }
    },
    onError: () => {
      setError('Error inesperado al eliminar tarea')
    },
  })

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) {
      setError('El título no puede estar vacío')
      return
    }
    addTaskMutation.mutate(newTaskTitle)
  }

  const handleEditTask = (task: Task) => {
    setEditingId(task.id)
    setEditingTitle(task.title)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTitle.trim()) {
      setError('El título no puede estar vacío')
      return
    }
    if (editingId) {
      updateTaskMutation.mutate(editingId)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingTitle('')
  }

  const handleLogout = async () => {
    const result = await signOut()
    if (result.success) {
      navigate('/login')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto p-6">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">AZAHAR</h1>
            <p className="text-gray-600 text-sm">Mis tareas</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Formulario para agregar tarea */}
        <form onSubmit={handleAddTask} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Añadir una nueva tarea..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            <button
              type="submit"
              disabled={addTaskMutation.isPending}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addTaskMutation.isPending ? 'Añadiendo...' : 'Añadir'}
            </button>
          </div>
        </form>

        {/* Mensajes de error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Lista de tareas */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-600">
              Cargando tareas...
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No hay tareas aún. ¡Añade una para comenzar!
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {tasks.map((task: Task) => (
                <li
                  key={task.id}
                  className="p-4 hover:bg-gray-50 transition flex items-center gap-3 group"
                >
                  {editingId === task.id ? (
                    <form onSubmit={handleSaveEdit} className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        autoFocus
                        className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                      <button
                        type="submit"
                        disabled={updateTaskMutation.isPending}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-3 py-2 bg-gray-400 hover:bg-gray-500 text-white text-sm font-medium rounded-lg transition"
                      >
                        Cancelar
                      </button>
                    </form>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleTaskMutation.mutate(task.id)}
                        disabled={toggleTaskMutation.isPending}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                          task.status === 'done'
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-green-500'
                        } disabled:opacity-50`}
                      >
                        {task.status === 'done' && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <div className={`flex-1 ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(task.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteTaskMutation.mutate(task.id)}
                          disabled={deleteTaskMutation.isPending}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded transition disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Contador */}
        {tasks.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>{tasks.filter(t => t.status === 'done').length} de {tasks.length} completada{tasks.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>
    </main>
  )
}
