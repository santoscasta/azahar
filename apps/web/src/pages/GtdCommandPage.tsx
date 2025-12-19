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
  const [quickCaptureProjectId, setQuickCaptureProjectId] = useState<string | null>(null)
  const [quickCaptureAreaId, setQuickCaptureAreaId] = useState<string | null>(null)
  const [quickCapturePriority, setQuickCapturePriority] = useState<0 | 1 | 2 | 3>(0)

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
      return addTask(
        quickCaptureTitle,
        quickCaptureNotes || undefined,
        quickCapturePriority,
        due ?? undefined,
        status,
        quickCaptureProjectId || undefined,
        quickCaptureAreaId || undefined
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gtd', 'tasks'] })
      setQuickCaptureTitle('')
      setQuickCaptureNotes('')
      setQuickCaptureProjectId(null)
      setQuickCaptureAreaId(null)
      setQuickCapturePriority(0)
      setCaptureView('inbox')
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
    { id: 'anytime', title: t('view.anytime'), accent: 'from-cyan-500 to-sky-500', subtitle: t('view.desc.anytime') },
    { id: 'someday', title: t('gtd.reflect'), accent: 'from-purple-500 to-pink-500', subtitle: t('gtd.reflect.subtitle') },
    { id: 'logbook', title: t('gtd.engage'), accent: 'from-slate-700 to-slate-500', subtitle: t('gtd.engage.subtitle') },
  ]

  const capturePresets: Array<{ id: QuickViewId; label: string; hint: string; accent: string }> = [
    { id: 'inbox', label: t('view.inbox'), hint: t('gtd.quickCapture.preset.inbox'), accent: 'from-orange-400/40 to-amber-300/30' },
    { id: 'today', label: t('view.today'), hint: t('gtd.quickCapture.preset.today'), accent: 'from-indigo-400/40 to-blue-400/30' },
    { id: 'upcoming', label: t('view.upcoming'), hint: t('gtd.quickCapture.preset.upcoming'), accent: 'from-green-400/30 to-emerald-300/30' },
    { id: 'anytime', label: t('view.anytime'), hint: t('gtd.quickCapture.preset.anytime'), accent: 'from-cyan-400/30 to-sky-300/30' },
    { id: 'someday', label: t('view.someday'), hint: t('gtd.quickCapture.preset.someday'), accent: 'from-purple-400/30 to-pink-300/30' },
  ]

  const priorityOptions: Array<{ value: 0 | 1 | 2 | 3; label: string; tone: string }> = [
    { value: 0, label: t('gtd.quickCapture.priority.default'), tone: 'bg-white/10 text-white' },
    { value: 1, label: t('gtd.quickCapture.priority.soft'), tone: 'bg-emerald-500/15 text-emerald-100' },
    { value: 2, label: t('gtd.quickCapture.priority.strong'), tone: 'bg-amber-500/15 text-amber-100' },
    { value: 3, label: t('gtd.quickCapture.priority.urgent'), tone: 'bg-rose-500/15 text-rose-100' },
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

  const focusTimeline = useMemo(() => ([
    { id: 'today' as QuickViewId, title: t('gtd.focus.today'), items: filterTasksByQuickView(tasks, 'today', todayISO) },
    { id: 'upcoming' as QuickViewId, title: t('gtd.focus.upcoming'), items: filterTasksByQuickView(tasks, 'upcoming', todayISO) },
    { id: 'anytime' as QuickViewId, title: t('gtd.focus.anytime'), items: filterTasksByQuickView(tasks, 'anytime', todayISO) },
  ]), [tasks, todayISO, t])

  const renderTaskMeta = (task: Task) => (
    <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
      {task.project_id && projectMap.get(task.project_id) ? (
        <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10">{projectMap.get(task.project_id)?.name}</span>
      ) : null}
      {task.area_id && areaMap.get(task.area_id) ? (
        <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10">{areaMap.get(task.area_id)?.name}</span>
      ) : null}
      {task.due_at ? <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10">{`${t('gtd.due')} ${task.due_at.slice(0, 10)}`}</span> : null}
    </div>
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B132B] via-[#0F172A] to-[#1F2937] text-white">
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

          <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-3">
            {lanes.map(lane => (
              <div key={lane.id} className="rounded-3xl bg-white/5 border border-white/10 p-4 space-y-2 shadow-2xl">
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-200">{lane.title}</p>
                <p className="text-3xl font-bold text-white">{stats[lane.id]}</p>
                <p className="text-xs text-slate-300">{lane.subtitle}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.35fr,1fr]">
            <form onSubmit={handleQuickAdd} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 space-y-5 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-200">{t('gtd.quickCapture.title')}</p>
                  <p className="text-sm text-slate-200">{t('gtd.quickCapture.subtitle')}</p>
                </div>
                {!isOnline && (
                  <span className="text-[11px] text-amber-200 bg-amber-500/10 border border-amber-200/40 px-3 py-1 rounded-full flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-300" aria-hidden />
                    {t('status.offline')}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                  <input
                    type="text"
                    value={quickCaptureTitle}
                    onChange={(event) => setQuickCaptureTitle(event.target.value)}
                    placeholder={t('gtd.quickCapture.placeholder')}
                    className="w-full bg-transparent text-lg font-semibold text-white placeholder:text-slate-400 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-300 mt-2">{t('gtd.quickCapture.notesHint')}</p>
                </div>
                <textarea
                  value={quickCaptureNotes}
                  onChange={(event) => setQuickCaptureNotes(event.target.value)}
                  placeholder={t('gtd.quickCapture.notes')}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7FD1AE]"
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-200">{t('gtd.quickCapture.when')}</p>
                    <p className="text-[11px] text-slate-400">{t('gtd.quickCapture.whenHint')}</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {capturePresets.map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setCaptureView(preset.id)}
                        className={`text-left rounded-2xl border ${captureView === preset.id ? 'border-white/40 bg-white/15' : 'border-white/10 bg-white/5'} px-3 py-2 transition hover:border-white/30 bg-gradient-to-br ${preset.accent}`}
                        aria-pressed={captureView === preset.id}
                      >
                        <p className="text-sm font-semibold text-white">{preset.label}</p>
                        <p className="text-[11px] text-slate-200">{preset.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-200">{t('gtd.quickCapture.destination')}</p>
                    <p className="text-[11px] text-slate-400">{t('gtd.quickCapture.destinationHint')}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                      <label className="text-[11px] uppercase tracking-[0.2em] text-slate-300">{t('context.label.project')}</label>
                      <select
                        value={quickCaptureProjectId ?? ''}
                        onChange={(event) => setQuickCaptureProjectId(event.target.value || null)}
                        className="w-full bg-transparent text-white mt-1 focus:outline-none"
                      >
                        <option value="" className="bg-slate-900">{t('gtd.quickCapture.projectPlaceholder')}</option>
                        {projects.map(project => (
                          <option key={project.id} value={project.id} className="bg-slate-900">{project.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                      <label className="text-[11px] uppercase tracking-[0.2em] text-slate-300">{t('context.label.area')}</label>
                      <select
                        value={quickCaptureAreaId ?? ''}
                        onChange={(event) => setQuickCaptureAreaId(event.target.value || null)}
                        className="w-full bg-transparent text-white mt-1 focus:outline-none"
                      >
                        <option value="" className="bg-slate-900">{t('gtd.quickCapture.areaPlaceholder')}</option>
                        {areas.map(area => (
                          <option key={area.id} value={area.id} className="bg-slate-900">{area.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  {priorityOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setQuickCapturePriority(option.value)}
                      className={`px-3 py-2 rounded-full border text-sm ${quickCapturePriority === option.value ? 'border-white/40' : 'border-white/15'} ${option.tone}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[11px] text-slate-400">{t('gtd.quickCapture.priorityHint')}</p>
                  <button
                    type="submit"
                    disabled={!quickCaptureTitle.trim() || addTaskMutation.isPending}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#7FD1AE] to-[#4FD1C5] text-[#0B132B] font-semibold shadow-lg hover:opacity-95 disabled:opacity-50"
                  >
                    {addTaskMutation.isPending ? t('gtd.quickCapture.saving') : t('gtd.quickCapture.cta')}
                  </button>
                </div>
              </div>
            </form>

            <aside className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 via-white/0 to-white/5 p-6 space-y-4 shadow-2xl">
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-slate-300">{t('gtd.focus.title')}</p>
                  <p className="text-sm text-slate-200">{t('gtd.focus.subtitle')}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs text-white/80">{tasks.length} {t('sidebar.tasks')}</span>
              </header>

              <div className="space-y-3">
                {focusTimeline.map(section => {
                  const items = section.items.slice(0, 4)
                  return (
                    <div key={section.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">{section.title}</p>
                        <span className="text-[11px] text-slate-300">{stats[section.id]}</span>
                      </div>
                      <div className="space-y-2">
                        {items.length === 0 ? (
                          <p className="text-xs text-slate-400">{t('gtd.focus.empty')}</p>
                        ) : items.map(task => (
                          <div key={task.id} className="flex items-start gap-3">
                            <span className="mt-2 h-2 w-2 rounded-full bg-[#7FD1AE]" aria-hidden />
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-semibold text-white">{task.title}</p>
                              <p className="text-xs text-slate-300 line-clamp-2">{task.notes ?? t('gtd.noNotes')}</p>
                              {renderTaskMeta(task)}
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleStatusMutation.mutate(task)}
                              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-semibold hover:bg-white/15"
                            >
                              {task.status === 'done' ? t('gtd.markOpen') : t('gtd.markDone')}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </aside>
          </div>
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
                          {renderTaskMeta(task)}
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
