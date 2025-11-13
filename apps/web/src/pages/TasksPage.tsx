import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  listTasks,
  searchTasks,
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
  const [newTaskNotes, setNewTaskNotes] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<0 | 1 | 2 | 3>(0)
  const [newTaskDueAt, setNewTaskDueAt] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingNotes, setEditingNotes] = useState('')
  const [editingPriority, setEditingPriority] = useState<0 | 1 | 2 | 3>(0)
  const [editingDueAt, setEditingDueAt] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [newProjectName, setNewProjectName] = useState('')
  const [showNewProject, setShowNewProject] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [showNewLabel, setShowNewLabel] = useState(false)
  const [selectedTaskForLabel, setSelectedTaskForLabel] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Consulta para obtener tareas con búsqueda y filtros
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', { projectId: selectedProjectId, labelIds: selectedLabelIds, q: searchQuery }],
    queryFn: async () => {
      const result = await searchTasks(
        searchQuery || undefined,
        selectedProjectId || undefined,
        selectedLabelIds.length > 0 ? selectedLabelIds : undefined
      )
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
    mutationFn: (args: { title: string; notes: string; priority: number; due_at: string }) =>
      addTask(args.title, args.notes || undefined, args.priority, args.due_at || undefined),
    onSuccess: (result) => {
      if (result.success) {
        setNewTaskTitle('')
        setNewTaskNotes('')
        setNewTaskPriority(0)
        setNewTaskDueAt('')
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
    mutationFn: (taskId: string) =>
      updateTask(taskId, {
        title: editingTitle,
        notes: editingNotes,
        priority: editingPriority,
        due_at: editingDueAt || null,
      }),
    onSuccess: (result) => {
      if (result.success) {
        setEditingId(null)
        setEditingTitle('')
        setEditingNotes('')
        setEditingPriority(0)
        setEditingDueAt('')
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
    addTaskMutation.mutate({
      title: newTaskTitle,
      notes: newTaskNotes,
      priority: newTaskPriority,
      due_at: newTaskDueAt,
    })
  }

  const handleEditTask = (task: Task) => {
    setEditingId(task.id)
    setEditingTitle(task.title)
    setEditingNotes(task.notes || '')
    setEditingPriority((task.priority || 0) as 0 | 1 | 2 | 3)
    setEditingDueAt(task.due_at ? task.due_at.split('T')[0] : '')
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
    setEditingNotes('')
    setEditingPriority(0)
    setEditingDueAt('')
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

        {/* Buscador y Filtros */}
        <div className="mb-8 space-y-4 p-5 bg-white rounded-lg shadow-md border border-gray-200">
          {/* Buscador */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Buscar</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título o notas..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Filtro por Proyecto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📁 Proyecto</label>
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="">Todos los proyectos</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Etiquetas (Multi-select) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🏷️ Etiquetas (selecciona una o más)</label>
            <div className="grid grid-cols-2 gap-2">
              {labels.map(label => (
                <label key={label.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedLabelIds.includes(label.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLabelIds([...selectedLabelIds, label.id])
                      } else {
                        setSelectedLabelIds(selectedLabelIds.filter(id => id !== label.id))
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{label.name}</span>
                </label>
              ))}
            </div>
            {selectedLabelIds.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedLabelIds.map(labelId => {
                  const label = labels.find(l => l.id === labelId)
                  return (
                    <span key={labelId} className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded-full flex items-center gap-1">
                      {label?.name}
                      <button
                        type="button"
                        onClick={() => setSelectedLabelIds(selectedLabelIds.filter(id => id !== labelId))}
                        className="hover:opacity-70"
                      >
                        ✕
                      </button>
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Formulario para agregar tarea */}
        <form onSubmit={handleAddTask} className="mb-8 p-5 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex gap-2 mb-3">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(Number(e.target.value) as 0 | 1 | 2 | 3)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="0">Sin prioridad</option>
                <option value="1">🟢 Baja</option>
                <option value="2">🟡 Media</option>
                <option value="3">🔴 Alta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento</label>
              <input
                type="date"
                value={newTaskDueAt}
                onChange={(e) => setNewTaskDueAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                value={newTaskNotes}
                onChange={(e) => setNewTaskNotes(e.target.value)}
                placeholder="Añade detalles..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              />
            </div>
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
              {searchQuery || selectedProjectId || selectedLabelIds.length > 0 
                ? 'No hay tareas que coincidan con los filtros' 
                : 'No hay tareas aún. ¡Añade una para comenzar!'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {tasks.map((task: Task) => {
                const taskProject = projects.find(p => p.id === task.project_id)
                return (
                  <li
                    key={task.id}
                    className="p-4 hover:bg-gray-50 transition flex flex-col gap-2 group"
                  >
                    {editingId === task.id ? (
                      <form onSubmit={handleSaveEdit} className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          placeholder="Título"
                          autoFocus
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        
                        <textarea
                          value={editingNotes}
                          onChange={(e) => setEditingNotes(e.target.value)}
                          placeholder="Notas..."
                          rows={2}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={editingPriority}
                            onChange={(e) => setEditingPriority(Number(e.target.value) as 0 | 1 | 2 | 3)}
                            className="px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          >
                            <option value="0">Sin prioridad</option>
                            <option value="1">🟢 Baja</option>
                            <option value="2">🟡 Media</option>
                            <option value="3">🔴 Alta</option>
                          </select>

                          <input
                            type="date"
                            value={editingDueAt}
                            onChange={(e) => setEditingDueAt(e.target.value)}
                            className="px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={updateTaskMutation.isPending}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                          >
                            {updateTaskMutation.isPending ? 'Guardando...' : 'Guardar'}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white text-sm font-medium rounded-lg transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleTaskMutation.mutate(task.id)}
                            disabled={toggleTaskMutation.isPending}
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition mt-1 ${
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

                          <div className="flex-1 min-w-0">
                            <div className={`${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-gray-900">{task.title}</p>
                                {taskProject && (
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                    {taskProject.name}
                                  </span>
                                )}
                                {task.priority && task.priority > 0 && (
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    task.priority === 1 ? 'bg-green-100 text-green-700' :
                                    task.priority === 2 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {task.priority === 1 ? '🟢 Baja' :
                                     task.priority === 2 ? '🟡 Media' :
                                     '🔴 Alta'}
                                  </span>
                                )}
                                {task.due_at && (
                                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                    📅 {new Date(task.due_at).toLocaleDateString('es-ES')}
                                  </span>
                                )}
                              </div>
                              {task.notes && (
                                <p className="text-sm text-gray-600 mt-1 italic">{task.notes}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(task.created_at).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                            <button
                              onClick={() => handleEditTask(task)}
                              className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded transition"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => deleteTaskMutation.mutate(task.id)}
                              disabled={deleteTaskMutation.isPending}
                              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded transition disabled:opacity-50"
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
        {tasks.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>{tasks.filter(t => t.status === 'done').length} de {tasks.length} completada{tasks.length !== 1 ? 's' : ''}</p>
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
