import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  listTasks,
  addTask,
  signOut,
  type Task,
  updateTask,
  toggleTaskStatus,
  deleteTask,
  getProjects,
  addProject,
  type Project,
  getLabels,
  addLabel,
  type Label,
  getTaskLabels,
  addTaskLabel,
  removeTaskLabel,
} from '../lib/supabase'

export default function TasksPage() {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [newProjectName, setNewProjectName] = useState('')
  const [showNewProject, setShowNewProject] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [showNewLabel, setShowNewLabel] = useState(false)
  const [selectedTaskForLabel, setSelectedTaskForLabel] = useState<string | null>(null)
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

  // Consulta para obtener proyectos
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const result = await getProjects()
      if (!result.success) {
        return []
      }
      return result.projects || []
    },
  })

  // Consulta para obtener etiquetas
  const { data: labels = [] } = useQuery({
    queryKey: ['labels'],
    queryFn: async () => {
      const result = await getLabels()
      if (!result.success) {
        return []
      }
      return result.labels || []
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

  // Mutación para agregar proyecto
  const addProjectMutation = useMutation({
    mutationFn: (name: string) => addProject(name),
    onSuccess: (result) => {
      if (result.success) {
        setNewProjectName('')
        setShowNewProject(false)
        setError('')
        queryClient.invalidateQueries({ queryKey: ['projects'] })
      } else {
        setError(result.error || 'Error al crear proyecto')
      }
    },
    onError: () => {
      setError('Error inesperado al crear proyecto')
    },
  })

  // Mutación para agregar etiqueta
  const addLabelMutation = useMutation({
    mutationFn: (name: string) => addLabel(name),
    onSuccess: (result) => {
      if (result.success) {
        setNewLabelName('')
        setShowNewLabel(false)
        setError('')
        queryClient.invalidateQueries({ queryKey: ['labels'] })
      } else {
        setError(result.error || 'Error al crear etiqueta')
      }
    },
    onError: () => {
      setError('Error inesperado al crear etiqueta')
    },
  })

  // Mutación para asignar etiqueta a tarea
  const addTaskLabelMutation = useMutation({
    mutationFn: ({ taskId, labelId }: { taskId: string; labelId: string }) =>
      addTaskLabel(taskId, labelId),
    onSuccess: (result) => {
      if (result.success) {
        setError('')
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al asignar etiqueta')
      }
    },
    onError: () => {
      setError('Error inesperado al asignar etiqueta')
    },
  })

  // Mutación para remover etiqueta de tarea
  const removeTaskLabelMutation = useMutation({
    mutationFn: ({ taskId, labelId }: { taskId: string; labelId: string }) =>
      removeTaskLabel(taskId, labelId),
    onSuccess: (result) => {
      if (result.success) {
        setError('')
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al remover etiqueta')
      }
    },
    onError: () => {
      setError('Error inesperado al remover etiqueta')
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

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) {
      setError('El nombre del proyecto no puede estar vacío')
      return
    }
    addProjectMutation.mutate(newProjectName)
  }

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLabelName.trim()) {
      setError('El nombre de la etiqueta no puede estar vacío')
      return
    }
    addLabelMutation.mutate(newLabelName)
  }

  const handleAddLabelToTask = (labelId: string) => {
    if (selectedTaskForLabel) {
      addTaskLabelMutation.mutate({ taskId: selectedTaskForLabel, labelId })
    }
  }

  const handleRemoveLabelFromTask = (taskId: string, labelId: string) => {
    removeTaskLabelMutation.mutate({ taskId, labelId })
  }

  const handleLogout = async () => {
    const result = await signOut()
    if (result.success) {
      navigate('/login')
    }
  }

  // Filtrar tareas según proyecto seleccionado
  const filteredTasks = selectedProjectId
    ? tasks.filter(t => t.project_id === selectedProjectId)
    : tasks

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
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Añadir una nueva tarea..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value || null)}
              className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="">Sin proyecto</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={addTaskMutation.isPending}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addTaskMutation.isPending ? 'Añadiendo...' : 'Añadir'}
            </button>
          </div>
        </form>

        {/* Botones para gestionar proyectos y etiquetas */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setShowNewProject(!showNewProject)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
          >
            {showNewProject ? 'Cancelar' : '+ Proyecto'}
          </button>
          <button
            onClick={() => setShowNewLabel(!showNewLabel)}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium rounded-lg transition"
          >
            {showNewLabel ? 'Cancelar' : '+ Etiqueta'}
          </button>
        </div>

        {/* Formulario para crear proyecto */}
        {showNewProject && (
          <form onSubmit={handleAddProject} className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Nombre del proyecto..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                type="submit"
                disabled={addProjectMutation.isPending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-50"
              >
                {addProjectMutation.isPending ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </form>
        )}

        {/* Formulario para crear etiqueta */}
        {showNewLabel && (
          <form onSubmit={handleAddLabel} className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="Nombre de la etiqueta..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              />
              <button
                type="submit"
                disabled={addLabelMutation.isPending}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition disabled:opacity-50"
              >
                {addLabelMutation.isPending ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </form>
        )}

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
          ) : filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              {selectedProjectId ? 'No hay tareas en este proyecto' : 'No hay tareas aún. ¡Añade una para comenzar!'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredTasks.map((task: Task) => {
                const taskProject = projects.find(p => p.id === task.project_id)
                return (
                  <li
                    key={task.id}
                    className="p-4 hover:bg-gray-50 transition flex flex-col gap-2 group"
                  >
                    {editingId === task.id ? (
                      <form onSubmit={handleSaveEdit} className="flex gap-2">
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
                        <div className="flex items-center gap-3">
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
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{task.title}</p>
                              {taskProject && (
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                  {taskProject.name}
                                </span>
                              )}
                            </div>
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
                              onClick={() => {
                                setSelectedTaskForLabel(task.id)
                                setShowNewLabel(true)
                              }}
                              className="px-3 py-1 bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs font-medium rounded transition"
                            >
                              Etiquetar
                            </button>
                            <button
                              onClick={() => deleteTaskMutation.mutate(task.id)}
                              disabled={deleteTaskMutation.isPending}
                              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded transition disabled:opacity-50"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                        {/* Mostrar etiquetas */}
                        {labels.length > 0 && (
                          <TaskLabels
                            taskId={task.id}
                            labels={labels}
                            onAddLabel={handleAddLabelToTask}
                            onRemoveLabel={handleRemoveLabelFromTask}
                            selectedTaskForLabel={selectedTaskForLabel}
                          />
                        )}
                      </>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Contador */}
        {filteredTasks.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>{filteredTasks.filter(t => t.status === 'done').length} de {filteredTasks.length} completada{filteredTasks.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>
    </main>
  )
}

// Componente auxiliar para mostrar etiquetas de una tarea
function TaskLabels({
  taskId,
  labels,
  onAddLabel,
  onRemoveLabel,
  selectedTaskForLabel,
}: {
  taskId: string
  labels: Label[]
  onAddLabel: (labelId: string) => void
  onRemoveLabel: (taskId: string, labelId: string) => void
  selectedTaskForLabel: string | null
}) {
  // En un caso real, aquí obtendríamos las etiquetas asignadas de la BD
  // Por ahora, mostraremos la opción de agregar etiquetas

  if (selectedTaskForLabel !== taskId) {
    return null
  }

  return (
    <div className="ml-9 mt-2 flex flex-wrap gap-2">
      {labels.map(label => (
        <button
          key={label.id}
          onClick={() => onAddLabel(label.id)}
          className="px-2 py-1 text-xs rounded-full bg-pink-100 hover:bg-pink-200 text-pink-700 transition"
        >
          + {label.name}
        </button>
      ))}
    </div>
  )
}
