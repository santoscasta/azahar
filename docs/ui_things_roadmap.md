# AZAHAR UI Things v2.1 Roadmap

Source: AZAHAR_Manual_Identidad_UI_Things_v2.1.pdf (text + images).
Goal: align desktop, iPad, and mobile UI to the Things-inspired structure while keeping Azahar identity and GTD tone.

## Key updates in v2.1
- Desktop is a single window: sidebar + list + detail column; focus mode hides the sidebar (not 3 independent views).
- Tasks have no time; only date. Time is reserved for calendar events (agenda shows only when calendar sync is enabled).
- Terminology: use “Cuando” (scheduled) and “Fecha límite” (deadline). Avoid “prioridad”; “Importante” is a precreated label.
- Quick Find is a dropdown anchored to the search input; selecting a result navigates and highlights the item.
- Tags: filter by a single tag (view), order rules, delete without confirmation.
- Mobile: no “This evening”; FAB is draggable; create modal only from the global (+).
- Governance: spacing 4/8/12/16/24, radii 8/12, shadows 1/2, labels neutral (colors reserved for deadlines/alerts).

## Delta vs current app
- Priority UI still exists; must be removed/converted to labels.
- Task time formatting may appear; needs date-only for tasks.
- Quick Find behaves like a full view; should be dropdown.
- Detail panel currently floats; manual suggests a right column inside the same window.
- Label filtering allows multiple selection; v2.1 requires single-label filtering.
- Mobile patterns (FAB drag, Upcoming grouping, multi-select) are missing.
- Widgets are missing.

## Roadmap (recalculated)

### Phase 1 - Terminology + Tokens
- Update spacing scale to 4/8/12/16/24 and radii to 8/12; reduce shadow levels to 1/2.
- Replace “Prioridad” with label-based “Importante”; ensure UI uses “Cuando/Fecha límite” language.
- Ensure tasks show date only (no time); keep time for calendar events only.
- Normalize chip colors: labels neutral, colors reserved for deadlines/overdue.

### Phase 2 - Desktop Core (window + focus)
- Layout: single window with sidebar + list + detail column; focus mode hides sidebar.
- Detail panel with anchored popovers (Cuando/Fecha límite/Tags) and actions (archivar, mover, convertir en proyecto, eliminar).
- Fixed action bar: + tarea, + sección (proyecto), calendario disabled unless task selected, mover, Quick Find.
- List rows: single-line meta, separators, show Project over Area when both exist.

### Phase 3 - Tags + Quick Find + Drag
- Quick Find dropdown (Cmd/Ctrl+K) with navigate + highlight behavior.
- Single-tag filter flow; tag ordering and delete rules.
- Drag & drop for tasks, projects, and sections.

### Phase 4 - iPad Adaptive Layout
- Stack/hybrid layout depending on width, consistent with desktop/mobile.
- Quick Find dropdown with highlight and navigation.

### Phase 5 - Mobile Experience
- Navigation list with back button; creation behavior from +.
- Today: no “This evening”, optional agenda, deadline flag rules.
- Upcoming: 7-day grouping then months; drag & drop; create after Today.
- Draggable FAB; drop to create, cancel target visible.
- Task create/edit: no X, cancel discards; checklist reorder; bottom bar actions.
- Multi-select + group actions; Quick Find highlight; disable tag filter in Upcoming.

### Phase 6 - Widgets + States + Governance
- Home + Lock Screen widgets.
- Loading/sync/empty states; AA contrast; focus visible; targets >= 44px.
- Governance checks for interaction changes.

## Phase notes / current status
- Phase 1 tokens updated to v2.1 spacing/radius/shadow scale; priority label migration still pending.
- Phase 2 in progress: layout now uses sidebar + list only (no third column) with focus-mode sidebar toggle; action bar includes move + Quick Find and calendar is disabled until a task is selected. Label chips are neutral, tasks show project over area when both exist, and Quick Find now navigates + highlights the selected task.

## Open questions
- Confirm whether desktop detail should be embedded as the right column or remain floating; v2.1 implies right-column detail inside the same window.
- Decide how to map existing priority values to “Importante” label (migration vs UI-only).

## Notes from images
- Desktop Today includes agenda only if calendar sync is enabled; event times appear in the agenda, not in tasks.
- Mobile Today shows neutral chips; deadline flag rules use red for today/past.
- Upcoming groups first 7 days separately, then by month.
