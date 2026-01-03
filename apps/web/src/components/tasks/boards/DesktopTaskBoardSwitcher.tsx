import type { ReactNode } from 'react'
import type { Area, Project, ProjectHeading, Task } from '../../../lib/supabase.js'
import ProjectBoard from './ProjectBoard.js'
import AreaBoard from './AreaBoard.js'
import QuickViewBoard, { type QuickViewGroup } from './QuickViewBoard.js'

interface DesktopTaskBoardSwitcherProps {
  selectedProject: Project | null
  selectedArea: Area | null
  projects: Project[]
  areas: Area[]
  projectHeadings: ProjectHeading[]
  filteredTasks: Task[]
  visibleProjectTasks: Task[]
  completedCount: number
  showCompletedTasks: boolean
  quickViewGroups: QuickViewGroup[]
  headingEditingId: string | null
  headingEditingName: string
  onStartEditHeading: (headingId: string, name: string) => void
  onChangeHeadingName: (value: string) => void
  onSaveHeadingName: () => void
  onCancelHeadingEdit: () => void
  onDeleteHeading: (headingId: string) => void
  onReorderHeadings: (payload: { projectId: string; orderedHeadingIds: string[]; movedHeadingId: string }) => void
  onMoveTaskToHeading?: (payload: { taskId: string; headingId: string | null }) => void
  onMoveTaskToProject?: (payload: { taskId: string; projectId: string | null; areaId: string | null }) => void
  onSelectArea: (areaId: string) => void
  onSelectProject: (projectId: string) => void
  renderTaskList: (tasks: Task[], options?: { showEmptyState?: boolean; dragEnabled?: boolean }) => ReactNode
  renderHeadingForm?: () => ReactNode
}

function renderProjectBoard({
  project,
  areas,
  headings,
  tasks,
  completedCount,
  showCompletedTasks,
  onStartEditHeading,
  onChangeHeadingName,
  onSaveHeadingName,
  onCancelHeadingEdit,
  onDeleteHeading,
  onReorderHeadings,
  onSelectArea,
  renderTaskList,
  renderHeadingForm,
  headingEditingId,
  headingEditingName,
  onMoveTaskToHeading,
}: {
  project: Project
  areas: Area[]
  headings: ProjectHeading[]
  tasks: Task[]
  completedCount: number
  showCompletedTasks: boolean
  headingEditingId: string | null
  headingEditingName: string
  onStartEditHeading: (headingId: string, name: string) => void
  onChangeHeadingName: (value: string) => void
  onSaveHeadingName: () => void
  onCancelHeadingEdit: () => void
  onDeleteHeading: (headingId: string) => void
  onReorderHeadings: (payload: { projectId: string; orderedHeadingIds: string[]; movedHeadingId: string }) => void
  onSelectArea: (areaId: string) => void
  renderTaskList: (tasks: Task[], options?: { showEmptyState?: boolean; dragEnabled?: boolean }) => ReactNode
  renderHeadingForm?: () => ReactNode
  onMoveTaskToHeading?: (payload: { taskId: string; headingId: string | null }) => void
}) {
  const headingsForProject = headings.filter(heading => heading.project_id === project.id)
  const tasksByHeading = new Map<string, Task[]>()
  tasks.forEach(task => {
    const key = task.heading_id || 'unassigned'
    if (!tasksByHeading.has(key)) {
      tasksByHeading.set(key, [])
    }
    tasksByHeading.get(key)!.push(task)
  })
  const projectAreaName = project.area_id ? areas.find(area => area.id === project.area_id)?.name || null : null

  return (
    <ProjectBoard
      project={project}
      headings={headingsForProject}
      tasksByHeading={tasksByHeading}
      completedCount={completedCount}
      totalCount={tasks.length}
      showCompletedTasks={showCompletedTasks}
      headingEditingId={headingEditingId}
      headingEditingName={headingEditingName}
      onStartEditHeading={onStartEditHeading}
      onChangeHeadingName={onChangeHeadingName}
      onSaveHeadingName={onSaveHeadingName}
      onCancelHeadingEdit={onCancelHeadingEdit}
      onDeleteHeading={onDeleteHeading}
      onReorderHeadings={onReorderHeadings}
      onSelectArea={onSelectArea}
      onMoveTaskToHeading={onMoveTaskToHeading}
      areaName={projectAreaName}
      renderTaskList={renderTaskList}
      renderHeadingForm={renderHeadingForm}
    />
  )
}

function renderAreaBoard({
  area,
  projects,
  tasks,
  completedCount,
  showCompletedTasks,
  onSelectProject,
  renderTaskList,
  onMoveTaskToProject,
}: {
  area: Area
  projects: Project[]
  tasks: Task[]
  completedCount: number
  showCompletedTasks: boolean
  onSelectProject: (projectId: string) => void
  renderTaskList: (tasks: Task[], options?: { showEmptyState?: boolean; dragEnabled?: boolean }) => ReactNode
  onMoveTaskToProject?: (payload: { taskId: string; projectId: string | null; areaId: string | null }) => void
}) {
  const projectsInArea = projects.filter(project => project.area_id === area.id)
  const tasksByProject = new Map<string, Task[]>()
  tasks.forEach(task => {
    const key = task.project_id || 'loose'
    if (!tasksByProject.has(key)) {
      tasksByProject.set(key, [])
    }
    tasksByProject.get(key)!.push(task)
  })
  const looseTasks = tasksByProject.get('loose') || []
  return (
    <AreaBoard
      areaId={area.id}
      areaName={area.name}
      projectCount={projectsInArea.length}
      completedCount={completedCount}
      totalCount={tasks.length}
      projects={projectsInArea}
      tasksByProject={tasksByProject}
      looseTasks={looseTasks}
      onSelectProject={onSelectProject}
      renderTaskList={(list) => renderTaskList(list, { showEmptyState: false, dragEnabled: true })}
      showCompletedTasks={showCompletedTasks}
      onMoveTaskToProject={onMoveTaskToProject}
    />
  )
}

export default function DesktopTaskBoardSwitcher({
  selectedProject,
  selectedArea,
  projects,
  areas,
  projectHeadings,
  filteredTasks,
  visibleProjectTasks,
  completedCount,
  showCompletedTasks,
  quickViewGroups,
  headingEditingId,
  headingEditingName,
  onStartEditHeading,
  onChangeHeadingName,
  onSaveHeadingName,
  onCancelHeadingEdit,
  onDeleteHeading,
  onReorderHeadings,
  onMoveTaskToHeading,
  onMoveTaskToProject,
  onSelectArea,
  onSelectProject,
  renderTaskList,
  renderHeadingForm,
}: DesktopTaskBoardSwitcherProps) {
  if (selectedProject) {
    return renderProjectBoard({
      project: selectedProject,
      areas,
      headings: projectHeadings,
      tasks: visibleProjectTasks,
      completedCount,
      showCompletedTasks,
      headingEditingId,
      headingEditingName,
      onStartEditHeading,
      onChangeHeadingName,
      onSaveHeadingName,
      onCancelHeadingEdit,
      onDeleteHeading,
      onReorderHeadings,
      onSelectArea,
      renderTaskList: (tasks, options) => renderTaskList(tasks, { ...options, dragEnabled: true }),
      renderHeadingForm,
      onMoveTaskToHeading,
    })
  }

  if (selectedArea) {
    return renderAreaBoard({
      area: selectedArea,
      projects,
      tasks: filteredTasks,
      completedCount,
      showCompletedTasks,
      onSelectProject,
      renderTaskList: (tasks, options) => renderTaskList(tasks, { ...options, dragEnabled: true }),
      onMoveTaskToProject,
    })
  }

  return (
    <QuickViewBoard
      groups={quickViewGroups}
      onSelectArea={onSelectArea}
      renderTaskList={(tasks) => renderTaskList(tasks, { showEmptyState: false })}
    />
  )
}
