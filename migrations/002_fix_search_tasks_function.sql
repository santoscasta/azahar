-- Migration: Fix search_tasks quick_view ambiguity after adding quick_view column
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
  priority int,
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
      t.priority,
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
      b.priority,
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
    priority,
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
