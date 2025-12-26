# Backend proposal (vNext)

This document captures the backend changes suggested for AZAHAR. It is written as a target design that can be implemented on top of the current Supabase stack (Auth + Postgres + RLS) or a dedicated API service.

## 1) Data model (target)

- users (auth provider)
- areas
  - id, user_id, name, sort_order, created_at, updated_at
- projects
  - id, user_id, area_id, name, color, sort_order, created_at, updated_at
- tasks
  - title, notes
  - status: inbox | next | waiting | someday | done
  - due_date, priority, context
  - area_id, project_id
  - completed_at, created_at, updated_at
  - last_modified, version, deleted_at (for sync and conflict control)
  - source (manual | ai), ai_session_id (traceability)
- labels (optional, if kept as a separate entity)
  - id, user_id, name, color
- contexts (optional)
  - id, user_id, name, color
  - Alternative: reuse labels with a "type=context" field.

## 2) API design (REST-first, GraphQL optional)

Base path: `/v1`

Auth and account
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/logout`
- POST `/auth/refresh`
- POST `/auth/forgot-password`
- POST `/auth/reset-password`
- GET `/me`
- PATCH `/me` (preferences, language, notification settings)

Areas
- GET `/areas`
- POST `/areas`
- PATCH `/areas/:id`
- DELETE `/areas/:id`

Projects
- GET `/projects?areaId=...`
- POST `/projects`
- PATCH `/projects/:id`
- DELETE `/projects/:id`

Tasks
- GET `/tasks?status=&areaId=&projectId=&labelId=&context=&due=&search=&limit=&cursor=`
- POST `/tasks`
- PATCH `/tasks/:id`
- DELETE `/tasks/:id`

Labels / Contexts (if separate tables)
- GET `/labels` and `/contexts`
- POST `/labels`, `/contexts`
- PATCH `/labels/:id`, `/contexts/:id`
- DELETE `/labels/:id`, `/contexts/:id`

Sync (offline-first)
- GET `/sync/pull?since=...`
- POST `/sync/push` (batched mutations with idempotency keys)

Privacy / GDPR
- GET `/account/export`
- DELETE `/account` (hard delete or scheduled purge)

AI microservice (separate service)
- POST `/ai/parse` -> returns draft tasks + confidence
- POST `/ai/confirm` -> creates tasks with source="ai"

GraphQL (optional)
- Expose a GraphQL schema mirroring the resources above for clients that prefer it.

## 3) Security and access control

- Passwords: argon2 or bcrypt + salt.
- Auth: JWT or secure sessions, refresh rotation, httpOnly cookies.
- HTTPS everywhere + HSTS.
- Access control: enforce per-user ownership in all queries/mutations.
- Shared areas (future): roles owner/editor/reader with explicit permissions.
- CSRF: SameSite cookies + CSRF tokens for state-changing requests.
- XSS: sanitize inputs, escape output, forbid unsafe HTML.
- Security headers: CSP, X-Content-Type-Options, Referrer-Policy, etc.
- Rate limiting and anomaly detection on auth and AI endpoints.

## 4) Persistence, offline sync, and conflicts

- Local store: IndexedDB (client) + sync worker.
- Conflict strategy: last_modified + version, with server-side merge rules.
- Idempotency: client_mutation_id to avoid duplicate writes.
- Soft deletes with deleted_at to allow conflict resolution.

## 5) Performance and scalability

- Indexes
  - tasks(user_id, status, due_date)
  - tasks(project_id), tasks(area_id)
  - GIN index on title/notes for search
- Pagination: cursor-based with stable ordering (due_date, created_at).
- Caching: Cache-Control for list endpoints, SWR on client.
- Observability: structured logs + metrics (error rate, latency, queue depth).

## 6) GTD business rules

- On completion: set completed_at and move to Logbook view.
- Weekly review: server query for Someday/Waiting and stale tasks.
- Notifications: push reminders for due_date with per-project settings.
- Calendar: list by day/week + drag and drop to adjust due_date.

## 7) AI microservice boundaries

- Strict validation: require confirmation before creating multiple tasks.
- Store provenance: source="ai", ai_session_id, ai_prompt_hash.
- User control: allow disabling AI globally in settings.
- Rate limits and audit trails for compliance.

## 8) Quality and governance

- OpenAPI/Swagger for REST endpoints.
- Tests: unit + integration + e2e + accessibility (axe).
- SemVer release tags (v1.0, v1.1, ...).
- Single source of truth for assets (icons, brand, templates).

## 9) Suggested incremental plan

1. Schema extensions: status enum, context field, version/last_modified, source, indexes.
2. Sync endpoints and client idempotency keys.
3. AI microservice with confirmation workflow and provenance metadata.
4. Notifications + calendar endpoints.
5. Observability + GDPR export/delete flows.
