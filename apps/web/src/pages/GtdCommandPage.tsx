import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addTask, getAreas, getProjects, searchTasks, toggleTaskStatus, type Task } from '../lib/supabase'
import { applyThemeToDocument, loadSettings, resolveThemePreference } from '../lib/settingsStore'
import { buildQuickViewStats, filterTasksByQuickView, type QuickViewId } from './tasksSelectors'
import { defaultDueForView, deriveStatusFromView } from '../lib/scheduleUtils'
import { useTranslations } from '../App'
import { useConnectivity } from '../hooks/useConnectivity'

interface LaneDescriptor {
  id: QuickViewId
  title: string
  accent: string
  subtitle: string
}

const buildISODate = (offsetDays = 0) => {
  const now = new Date()
  now.setDate(now.getDate() + offsetDays)
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export default function GtdCommandPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t, language } = useTranslations()
  const isOnline = useConnectivity()
  const todayISO = useMemo(() => buildISODate(), [])
  const tomorrowISO = useMemo(() => buildISODate(1), [])
  const [quickCaptureTitle, setQuickCaptureTitle] = useState('')
  const [quickCaptureNotes, setQuickCaptureNotes] = useState('')
  const [captureView, setCaptureView] = useState<QuickViewId>('inbox')

  const tasksQuery = useQuery({
    queryKey: ['gtd', 'tasks'],
    queryFn: async () => {
      const result = await searchTasks()
      if (!result.success) throw new Error(result.error || 'Error')
      return result.tasks ?? []
    },
  })

  const projectsQuery = useQuery({
    queryKey: ['gtd', 'projects'],
    queryFn: async () => {
      const result = await getProjects()
      if (!result.success) throw new Error(result.error || 'Error')
      return result.projects ?? []
    },
  })

  const areasQuery = useQuery({
    queryKey: ['gtd', 'areas'],
    queryFn: async () => {
      const result = await getAreas()
      if (!result.success) throw new Error(result.error || 'Error')
      return result.areas ?? []
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: async (task: Task) => toggleTaskStatus(task.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gtd', 'tasks'] }),
  })

  const addTaskMutation = useMutation({
    mutationFn: async () => {
      const due = defaultDueForView(captureView, todayISO, tomorrowISO)
      const status = deriveStatusFromView(captureView)
      return addTask(quickCaptureTitle, quickCaptureNotes || undefined, 0, due ?? undefined, status)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gtd', 'tasks'] })
      setQuickCaptureTitle('')
      setQuickCaptureNotes('')
    },
  })

  const tasks = tasksQuery.data ?? []
  const stats = useMemo(() => buildQuickViewStats(tasks, todayISO), [tasks, todayISO])
  const projects = projectsQuery.data ?? []
  const areas = areasQuery.data ?? []
  const projectMap = useMemo(() => new Map(projects.map(project => [project.id, project])), [projects])
  const areaMap = useMemo(() => new Map(areas.map(area => [area.id, area])), [areas])

  const lanes: LaneDescriptor[] = [
    { id: 'inbox', title: t('gtd.capture'), accent: 'from-orange-500 to-amber-400', subtitle: t('gtd.capture.subtitle') },
    { id: 'today', title: t('gtd.clarify'), accent: 'from-indigo-500 to-blue-500', subtitle: t('gtd.clarify.subtitle') },
    { id: 'upcoming', title: t('gtd.organize'), accent: 'from-green-500 to-emerald-400', subtitle: t('gtd.organize.subtitle') },
    { id: 'someday', title: t('gtd.reflect'), accent: 'from-purple-500 to-pink-500', subtitle: t('gtd.reflect.subtitle') },
    { id: 'logbook', title: t('gtd.engage'), accent: 'from-slate-700 to-slate-500', subtitle: t('gtd.engage.subtitle') },
  ]

  const laneContent = (laneId: QuickViewId) => filterTasksByQuickView(tasks, laneId, todayISO).slice(0, 6)

  useEffect(() => {
    const settings = loadSettings()
    applyThemeToDocument(resolveThemePreference(settings.theme))
    document.documentElement.lang = language
  }, [language])

  const handleQuickAdd = (event: React.FormEvent) => {
    event.preventDefault()
    if (!quickCaptureTitle.trim() || addTaskMutation.isPending) return
    addTaskMutation.mutate()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B132B] via-[#151515] to-[#2D3436] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
        <header className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-[#7FD1AE]">GTD</p>
              <h1 className="text-4xl md:text-5xl font-semibold text-white drop-shadow-sm">{t('gtd.title')}</h1>
              <p className="text-sm md:text-base text-slate-200 max-w-2xl">{t('gtd.subtitle')}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-slate-200">
              <button
                type="button"
                onClick={() => navigate('/app')}
                className="px-4 py-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10"
              >
                {t('gtd.switchClassic')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/settings')}
                className="px-4 py-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10"
              >
                {t('gtd.settings')}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-3">
            {lanes.map(lane => (
              <div key={lane.id} className="rounded-3xl bg-white/5 border border-white/10 p-4 space-y-2 shadow-2xl">
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-200">{lane.title}</p>
                <p className="text-3xl font-bold text-white">{stats[lane.id]}</p>
                <p className="text-xs text-slate-300">{lane.subtitle}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleQuickAdd} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5 space-y-3 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:gap-3">
              <input
                type="text"
                value={quickCaptureTitle}
                onChange={(event) => setQuickCaptureTitle(event.target.value)}
                placeholder={t('gtd.quickCapture.placeholder')}
                className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7FD1AE]"
              />
              <select
                value={captureView}
                onChange={(event) => setCaptureView(event.target.value as QuickViewId)}
                className="mt-3 md:mt-0 rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-sm text-white focus:outline-none"
              >
                <option value="inbox">{t('view.inbox')}</option>
                <option value="today">{t('view.today')}</option>
                <option value="upcoming">{t('view.upcoming')}</option>
                <option value="someday">{t('view.someday')}</option>
              </select>
              <button
                type="submit"
                disabled={!quickCaptureTitle.trim() || addTaskMutation.isPending}
                className="mt-3 md:mt-0 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#7FD1AE] to-[#4FD1C5] text-[#0B132B] font-semibold shadow-lg hover:opacity-95 disabled:opacity-50"
              >
                {addTaskMutation.isPending ? t('gtd.quickCapture.saving') : t('gtd.quickCapture.cta')}
              </button>
            </div>
            <textarea
              value={quickCaptureNotes}
              onChange={(event) => setQuickCaptureNotes(event.target.value)}
              placeholder={t('gtd.quickCapture.notes')}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7FD1AE]"
              rows={2}
            />
            {!isOnline && (
              <p className="text-xs text-amber-300 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
                {t('status.offline')}
              </p>
            )}
          </form>
        </header>

        <section className="space-y-4">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {lanes.map(lane => (
              <div key={lane.id} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/5 p-5 space-y-4 shadow-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-300">{lane.title}</p>
                    <p className="text-lg text-white/90">{lane.subtitle}</p>
                  </div>
                  <span className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${lane.accent} flex items-center justify-center text-sm font-bold text-white/90`}>
                    {stats[lane.id]}
                  </span>
                </div>
                <div className="space-y-3">
                  {laneContent(lane.id).map(task => (
                    <article key={task.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                      <header className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-white">{task.title}</p>
                          <p className="text-xs text-slate-300 line-clamp-2">{task.notes ?? t('gtd.noNotes')}</p>
                          <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                            {task.project_id && projectMap.get(task.project_id) ? (
                              <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10">{projectMap.get(task.project_id)?.name}</span>
                            ) : null}
                            {task.area_id && areaMap.get(task.area_id) ? (
                              <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10">{areaMap.get(task.area_id)?.name}</span>
                            ) : null}
                            {task.due_at ? <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10">{`${t('gtd.due')} ${task.due_at.slice(0, 10)}`}</span> : null}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleStatusMutation.mutate(task)}
                          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/15"
                        >
                          {task.status === 'done' ? t('gtd.markOpen') : t('gtd.markDone')}
                        </button>
                      </header>
                    </article>
                  ))}
                  {laneContent(lane.id).length === 0 && (
                    <p className="text-sm text-slate-300">{t('gtd.empty')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
