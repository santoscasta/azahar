-- Migration: Add quick_view column to tasks table
-- This column is used to store the quick view type (inbox, today, upcoming, etc.)
-- Required for the search_tasks RPC function to work correctly

alter table public.tasks
  add column if not exists quick_view text;

-- Ensure the column can be updated
alter table public.tasks enable row level security;

-- Update RLS policy if needed (assuming "tasks by owner" policy exists)
-- The existing RLS policy should already cover this new column
