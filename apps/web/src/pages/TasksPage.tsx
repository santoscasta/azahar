import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { listTasks, addTask, signOut, type Task } from '../lib/supabase'

export default function TasksPage() {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [error, setError] = useState('')
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
        // Invalida el caché para refrescar la lista
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al crear tarea')
      }
    },
    onError: () => {
      setError('Error inesperado al crear tarea')
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
                  className="p-4 hover:bg-gray-50 transition flex items-center gap-3"
                >
                  <div className="flex-1">
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
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.status === 'done'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {task.status === 'done' ? 'Completada' : 'Abierta'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Contador */}
        {tasks.length > 0 && (
          <p className="mt-4 text-center text-sm text-gray-600">
            {tasks.length} tarea{tasks.length !== 1 ? 's' : ''} en total
          </p>
        )}
      </div>
    </main>
  )
}
