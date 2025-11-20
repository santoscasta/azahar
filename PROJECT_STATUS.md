# 📊 Estado del Proyecto AZAHAR — v0.6.0

```
╔════════════════════════════════════════════════════════════════╗
║            AZAHAR - Gestor de Tareas Minimalista                ║
║                 Estado: 🟢 FUNCIONANDO (v0.6.0)                 ║
╚════════════════════════════════════════════════════════════════╝
```

## Snapshot Rápido
- Frontend: React 18 + Vite + TypeScript, UI responsiva (desktop/móvil) con quick views, áreas/proyectos, secciones y checklists.
- Backend: Supabase (Auth + PostgreSQL + Storage) con RLS en tasks, projects, labels, task_labels, areas, project_headings y checklist_items.
- Calidad: 35/35 tests Vitest (selectores/ux pura) + smoke e2e Playwright apoyado por seed determinista.
- Deploy: Vercel listo (`vercel.json` con `pnpm -C apps/web build` y `apps/web/dist`).

## Funcionalidad Clave
- Auth completa (signup/login/logout) y ruta protegida `/app`.
- Gestor de tareas con notas, prioridad, vencimiento, checklist, etiquetas, proyectos, áreas y secciones.
- Quick views (Inbox, Hoy, Próximas, Algún día, Logbook) y chips de filtros activos.
- UI móvil: overview, boards paginados, FAB + sheets de creación/agenda/labels.
- Experiencia desktop: task board modular, date picker overlay, switcher de vistas, edición inline.

## QA & Datos de Prueba
- Seed reproducible: `pnpm -C apps/web seed:test` (requiere `SUPABASE_SERVICE_ROLE_KEY`, crea `test@azahar.app/password123` + dataset Smoke).
- Reset: `pnpm -C apps/web reset:test` elimina usuario y datos asociados.
- Smoke Playwright: `pnpm -C apps/web test:e2e` valida login -> `/app` y toggle de tarea seeded.
- Unit/selector tests: `pnpm -C apps/web test` (Vitest + jsdom).

## Próximos Focos
- Migrar filtros/búsquedas a Supabase (RPC o queries parametrizadas) para reducir payload.
- Ampliar cobertura e2e (creación/edición/filtrado) sobre el seed.
- Refinar documentación de despliegue con variables `VITE_APP_BASE_URL` y secrets de service role fuera del bundle.
