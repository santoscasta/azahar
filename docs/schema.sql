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
  priority int default 0,
  due_at timestamptz,
  start_at timestamptz,
  repeat_rrule text,
  reminder_at timestamptz,
  updated_at timestamptz default now(),
  created_at timestamptz default now(),
  completed_at timestamptz
);

alter table tasks
  add column if not exists area_id uuid references areas(id) on delete set null;

alter table tasks
  add column if not exists heading_id uuid references project_headings(id) on delete set null;

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

-- Políticas RLS: áreas
do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'areas'
      and policyname = 'areas by owner'
  ) then
    execute 'alter policy "areas by owner" on public.areas using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  else
    execute 'create policy "areas by owner" on public.areas for all using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  end if;
end $$;

-- Políticas RLS: projects (solo el propietario puede acceder)
do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'projects'
      and policyname = 'projects by owner'
  ) then
    execute 'alter policy "projects by owner" on public.projects using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  else
    execute 'create policy "projects by owner" on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  end if;
end $$;

-- Políticas RLS: project_headings
do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'project_headings'
      and policyname = 'headings by owner'
  ) then
    execute 'alter policy "headings by owner" on public.project_headings using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  else
    execute 'create policy "headings by owner" on public.project_headings for all using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  end if;
end $$;

-- Políticas RLS: tasks (solo el propietario puede acceder)
do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'tasks'
      and policyname = 'tasks by owner'
  ) then
    execute 'alter policy "tasks by owner" on public.tasks using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  else
    execute 'create policy "tasks by owner" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  end if;
end $$;

-- Políticas RLS: labels (solo el propietario puede acceder)
do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'labels'
      and policyname = 'labels by owner'
  ) then
    execute 'alter policy "labels by owner" on public.labels using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  else
    execute 'create policy "labels by owner" on public.labels for all using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  end if;
end $$;

-- Políticas RLS: task_labels (acceso si el usuario es propietario de la tarea y la etiqueta)
do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'task_labels'
      and policyname = 'task_labels by owner'
  ) then
    execute '
      alter policy "task_labels by owner" on public.task_labels
      using (
        exists (select 1 from tasks t where t.id = task_id and t.user_id = auth.uid())
        and exists (select 1 from labels l where l.id = label_id and l.user_id = auth.uid())
      )
      with check (
        exists (select 1 from tasks t where t.id = task_id and t.user_id = auth.uid())
        and exists (select 1 from labels l where l.id = label_id and l.user_id = auth.uid())
      )';
  else
    execute '
      create policy "task_labels by owner" on public.task_labels
      for all using (
        exists (select 1 from tasks t where t.id = task_id and t.user_id = auth.uid())
        and exists (select 1 from labels l where l.id = label_id and l.user_id = auth.uid())
      )
      with check (
        exists (select 1 from tasks t where t.id = task_id and t.user_id = auth.uid())
        and exists (select 1 from labels l where l.id = label_id and l.user_id = auth.uid())
      )';
  end if;
end $$;
