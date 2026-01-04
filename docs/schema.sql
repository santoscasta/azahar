-- Crear extensiones necesarias
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Tabla: áreas
create table if not exists areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Tabla: projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  sort_order int default 0,
  area_id uuid references areas(id) on delete set null,
  created_at timestamptz default now()
);

alter table projects
  add column if not exists area_id uuid references areas(id) on delete set null;

-- Tabla: project_headings
create table if not exists project_headings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Tabla: tasks
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  area_id uuid references areas(id) on delete set null,
  heading_id uuid references project_headings(id) on delete set null,
  title text not null,
  notes text,
  status text default 'open', -- open|done|snoozed
  due_at timestamptz,
  deadline_at timestamptz,
  start_at timestamptz,
  repeat_rrule text,
  reminder_at timestamptz,
  updated_at timestamptz default now(),
  created_at timestamptz default now(),
  completed_at timestamptz,
  pinned boolean default false,
  sort_orders jsonb default '{}'::jsonb
);

alter table tasks
  add column if not exists area_id uuid references areas(id) on delete set null;

alter table tasks
  add column if not exists heading_id uuid references project_headings(id) on delete set null;
alter table tasks
  add column if not exists pinned boolean default false;

alter table tasks
  add column if not exists quick_view text;
alter table tasks
  add column if not exists deadline_at timestamptz;
alter table tasks
  add column if not exists sort_orders jsonb default '{}'::jsonb;

-- Tabla: task_checklist_items
create table if not exists task_checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references tasks(id) on delete cascade,
  text text not null,
  completed boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabla: labels
create table if not exists labels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text
);

-- Tabla: task_labels (relación muchos a muchos)
create table if not exists task_labels (
  task_id uuid references tasks(id) on delete cascade,
  label_id uuid references labels(id) on delete cascade,
  primary key (task_id, label_id)
);

-- Habilitar Row Level Security
alter table areas enable row level security;
alter table projects enable row level security;
alter table project_headings enable row level security;
alter table tasks enable row level security;
alter table labels enable row level security;
alter table task_labels enable row level security;
alter table task_checklist_items enable row level security;
alter table task_checklist_items
  add column if not exists updated_at timestamptz default now();

do $areas$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'areas'
      and policyname = 'areas by owner'
  ) then
    execute $$alter policy "areas by owner" on public.areas using (auth.uid() = user_id) with check (auth.uid() = user_id)$$;
  else
    execute $$create policy "areas by owner" on public.areas for all using (auth.uid() = user_id) with check (auth.uid() = user_id)$$;
  end if;
end $areas$;

-- Políticas RLS: projects (solo el propietario puede acceder)
do $projects$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'projects'
      and policyname = 'projects by owner'
  ) then
    execute $$alter policy "projects by owner" on public.projects using (auth.uid() = user_id) with check (auth.uid() = user_id)$$;
  else
    execute $$create policy "projects by owner" on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id)$$;
  end if;
end $projects$;

-- Políticas RLS: project_headings
do $headings$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'project_headings'
      and policyname = 'headings by owner'
  ) then
    execute $$alter policy "headings by owner" on public.project_headings using (auth.uid() = user_id) with check (auth.uid() = user_id)$$;
  else
    execute $$create policy "headings by owner" on public.project_headings for all using (auth.uid() = user_id) with check (auth.uid() = user_id)$$;
  end if;
end $headings$;

-- Políticas RLS: tasks (solo el propietario puede acceder)
do $tasks$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'tasks'
      and policyname = 'tasks by owner'
  ) then
    execute $$alter policy "tasks by owner" on public.tasks using (auth.uid() = user_id) with check (auth.uid() = user_id)$$;
  else
    execute $$create policy "tasks by owner" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id)$$;
  end if;
end $tasks$;

-- Políticas RLS: labels (solo el propietario puede acceder)
do $labels$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'labels'
      and policyname = 'labels by owner'
  ) then
    execute $$alter policy "labels by owner" on public.labels using (auth.uid() = user_id) with check (auth.uid() = user_id)$$;
  else
    execute $$create policy "labels by owner" on public.labels for all using (auth.uid() = user_id) with check (auth.uid() = user_id)$$;
  end if;
end $labels$;

-- Políticas RLS: task_labels (acceso si el usuario es propietario de la tarea y la etiqueta)
do $task_labels$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'task_labels'
      and policyname = 'task_labels by owner'
  ) then
    execute $$
      alter policy "task_labels by owner" on public.task_labels
      using (
        exists (select 1 from tasks t where t.id = task_id and t.user_id = auth.uid())
        and exists (select 1 from labels l where l.id = label_id and l.user_id = auth.uid())
      )
      with check (
        exists (select 1 from tasks t where t.id = task_id and t.user_id = auth.uid())
        and exists (select 1 from labels l where l.id = label_id and l.user_id = auth.uid())
      )$$;
  else
    execute $$
      create policy "task_labels by owner" on public.task_labels
      for all using (
        exists (select 1 from tasks t where t.id = task_id and t.user_id = auth.uid())
        and exists (select 1 from labels l where l.id = label_id and l.user_id = auth.uid())
      )
      with check (
        exists (select 1 from tasks t where t.id = task_id and t.user_id = auth.uid())
        and exists (select 1 from labels l where l.id = label_id and l.user_id = auth.uid())
      )$$;
  end if;
end $task_labels$;

-- Políticas RLS: task_checklist_items (solo propietario)
do $task_checklists$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'task_checklist_items'
      and policyname = 'checklists by owner'
  ) then
    execute $$alter policy "checklists by owner" on public.task_checklist_items using (auth.uid() = user_id) with check (auth.uid() = user_id)$$;
  else
    execute $$create policy "checklists by owner" on public.task_checklist_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id)$$;
  end if;
end $task_checklists$;

-- RPC: search_tasks (filtros en servidor + quick view calculada)
drop function if exists public.search_tasks(text, uuid, uuid[], uuid, text);

create or replace function public.search_tasks(
  p_query text default null,
  p_project_id uuid default null,
  p_label_ids uuid[] default null,
  p_area_id uuid default null,
  p_quick_view text default null
)
returns table (
  id uuid,
  user_id uuid,
  project_id uuid,
  area_id uuid,
  heading_id uuid,
  title text,
  notes text,
  status text,
  due_at timestamptz,
  start_at timestamptz,
  repeat_rrule text,
  reminder_at timestamptz,
  updated_at timestamptz,
  created_at timestamptz,
  completed_at timestamptz,
  pinned boolean,
  quick_view text,
  labels jsonb,
  checklist_items jsonb,
  client_mutation_id text
)
language sql
stable
as $$
  with base as (
    select
      t.id,
      t.user_id,
      t.project_id,
      t.area_id,
      t.heading_id,
      t.title,
      t.notes,
      t.status,
      t.due_at,
      t.start_at,
      t.repeat_rrule,
      t.reminder_at,
      t.updated_at,
      t.created_at,
      t.completed_at,
      t.pinned,
      t.client_mutation_id,
      case
        when t.status = 'done' then 'logbook'
        when t.status = 'snoozed' then 'someday'
        when t.due_at is not null and t.due_at::date <= current_date then 'today'
        when t.due_at is not null then 'upcoming'
        when t.project_id is null and t.area_id is null then 'inbox'
        else 'anytime'
      end as quick_view
    from public.tasks t
    where t.user_id = auth.uid()
      and (p_project_id is null or t.project_id = p_project_id)
      and (p_area_id is null or t.area_id = p_area_id)
      and (
        p_query is null
        or p_query = ''
        or t.title ilike '%' || p_query || '%'
        or t.notes ilike '%' || p_query || '%'
      )
      and (
        p_label_ids is null
        or array_length(p_label_ids, 1) is null
        or t.id in (
          select tl.task_id
          from public.task_labels tl
          where tl.label_id = any (p_label_ids)
          group by tl.task_id
          having count(*) = array_length(p_label_ids, 1)
        )
      )
  ),
  enriched as (
    select
      b.id,
      b.user_id,
      b.project_id,
      b.area_id,
      b.heading_id,
      b.title,
      b.notes,
      b.status,
      b.due_at,
      b.start_at,
      b.repeat_rrule,
      b.reminder_at,
      b.updated_at,
      b.created_at,
      b.completed_at,
      b.pinned,
      b.quick_view,
      coalesce(
        (
          select json_agg(
            json_build_object(
              'id', l.id,
              'name', l.name,
              'color', l.color
            )
            order by l.name
          )
          from public.task_labels tl
          join public.labels l on tl.label_id = l.id
          where tl.task_id = b.id
        ),
        '[]'
      ) as labels,
      coalesce(
        (
          select json_agg(
            json_build_object(
              'id', c.id,
              'task_id', c.task_id,
              'user_id', c.user_id,
              'text', c.text,
              'completed', c.completed,
              'sort_order', c.sort_order,
              'created_at', c.created_at,
              'updated_at', c.updated_at
            )
            order by c.sort_order, c.created_at
          )
          from public.task_checklist_items c
          where c.task_id = b.id
        ),
        '[]'
      ) as checklist_items,
      b.client_mutation_id
    from base b
  )
  select
    id,
    user_id,
    project_id,
    area_id,
    heading_id,
    title,
    notes,
    status,
    due_at,
    start_at,
    repeat_rrule,
    reminder_at,
    updated_at,
    created_at,
    completed_at,
    pinned,
    quick_view,
    labels,
    checklist_items,
    client_mutation_id
  from enriched
  where (p_quick_view is null or p_quick_view = '' or quick_view = p_quick_view)
  order by due_at asc nulls first, created_at desc;
$$;
