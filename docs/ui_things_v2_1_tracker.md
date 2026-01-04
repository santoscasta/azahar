# AZAHAR UI Things v2.1 Implementation Tracker

Source: AZAHAR_Manual_Identidad_UI_Things_v2.1.pdf
Last updated: 2026-01-03

Legend: ☐ todo · ⏳ in progress · ✅ done
Progreso: 43/43 módulos completados · 0 pendientes · 0 en curso

## 1) Foundations & Terminology
- ✅ Update spacing scale to 4/8/12/16/24 (p.24)
- ✅ Update radii to 8/12 and reduce shadows to levels 1/2 (p.24)
- ✅ Replace “Prioridad” UI with “Importante” label; avoid priority language (p.11, p.24)
- ✅ Terminology: “Cuando” (scheduled) and “Fecha límite” (deadline) across UI (p.17, p.24)
- ✅ Tasks show date only; time reserved for calendar events (p.9, p.10)
- ✅ Label chips neutral; colors reserved for deadlines/alerts (p.15, p.23)

## 2) Desktop Core
- ✅ Single window layout: sidebar + list (no third column) (p.8-9)
- ✅ Focus mode: hide sidebar toggle, available in all views (p.8-9)
- ✅ Detail panel: anchored popovers; notes + checklist separation (p.10)
- ✅ Detail actions: archivar, mover, convertir en proyecto, eliminar (p.10)
- ✅ Meta chips show notes/checklist/labels/deadline flag (p.9)
- ✅ Show Project over Area when both exist (p.9)
- ✅ Agenda shows only with calendar sync; event times only (p.9)
- ✅ Fixed action bar: + tarea, + sección, calendario, mover, Quick Find (p.11)

## 3) Tags & Quick Find
- ✅ Quick Find dropdown anchored to search input; navigate + highlight on select (p.13, p.20)
- ✅ Single-tag filter behavior; no multi-tag filtering (p.12)
- ✅ Tag creation: type to create if missing; ordering rules (p.12)
- ✅ Delete tag removes it from all tasks without confirmation (p.12)

## 4) Drag & Drop
- ✅ Drag & drop tasks between dates/projects/sections (desktop + mobile) (p.16, p.23)
- ✅ Drag & drop for project sections ordering (p.11, p.23)

## 5) iPad
- ✅ Adaptive stack/hybrid layout per width (p.13)
- ✅ Quick Find dropdown with highlight behavior (p.13)
- ✅ Area/project navigation consistent with desktop (p.13)

## 6) Mobile Navigation & Lists
- ✅ Navigation list for views/areas/projects; back button (p.14)
- ✅ Create (+) from navigation; modal only when not inside a view (p.14, p.17)
- ✅ Today: no “This evening”; agenda optional; neutral chips (p.15)
- ✅ Deadline flag rules: future gray with d/m, today red “hoy”, past red “hace Xd” (p.15)
- ✅ Upcoming: first 7 days then months; drag & drop; create after Today (p.16)
- ✅ Order lists/labels by usage/internal order, not alphabetically (p.16)
- ✅ Quick Find results navigate + highlight (p.20)
- ✅ Disable tag filter in Upcoming (p.20)

## 7) Mobile Create & Edit
- ✅ Create modal: no X; cancel discards changes (p.17)
- ✅ Project selector order: Inbox, none, projects without area, areas/projects (p.17)
- ✅ Checklist reorder with drag; tap toggles complete (p.17)
- ✅ FAB: draggable create, drop-to-inbox, cancel target (p.18)
- ✅ “Cuando” icon shown left of task; deadline flag at end (p.18)
- ✅ Edit screen: notes in Markdown; bottom actions (move, delete, menu) (p.19)

## 8) Multi-select & Batch Actions
- ✅ Multi-select mode in lists; batch actions, paste, share (p.15)

## 9) Widgets
- ✅ Home widget: Today count + short list; tap opens Today (p.21) [web preview]
- ✅ Lock screen widget: quick access to Today (p.22) [web preview]

## 10) States, Accessibility, Governance
- ✅ Targets >= 44px (mobile), focus visible, AA contrast (p.23)
- ✅ Loading/sync non-blocking; empty states with contextual CTA (p.23)
- ✅ Governance: validate interaction changes against manual (p.24)

## Open questions
- Define migration strategy from priority field to “Importante” label.
- Desktop detail view: use inline editor/popover within the list instead of a third column (per latest UI direction).
- Confirm if labels/checklist/move sheets should also use anchored popovers on desktop (currently still bottom sheets).
- Widgets native (Home/Lock Screen) quedan fuera del alcance web; hay preview en Ayuda.
- Reasignar `sort_orders` al mover tareas entre listas/áreas/proyectos para que entren al final del destino.
