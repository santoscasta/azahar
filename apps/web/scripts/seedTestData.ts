import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load local env (same shape as Vite) and allow an extra file for secrets used only in scripts.
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
dotenv.config({ path: path.resolve(__dirname, '../.env.seed'), override: false })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Faltan variables: define VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para sembrar datos.')
  process.exit(1)
}

const TEST_EMAIL = 'test@azahar.app'
const TEST_PASSWORD = 'password123'

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function recreateTestUser() {
  const { data: existingUsers, error: listError } = await adminClient.auth.admin.listUsers({ email: TEST_EMAIL })
  if (listError) {
    throw listError
  }
  const current = existingUsers.users?.[0]
  if (current) {
    await adminClient.auth.admin.deleteUser(current.id)
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  })
  if (error || !data.user) {
    throw error ?? new Error('No se pudo crear el usuario de prueba')
  }
  return data.user.id
}

async function seedData(userId: string) {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const { data: area, error: areaError } = await adminClient
    .from('areas')
    .insert({
      user_id: userId,
      name: 'Smoke Area',
      sort_order: 0,
    })
    .select()
    .single()
  if (areaError) throw areaError

  const { data: project, error: projectError } = await adminClient
    .from('projects')
    .insert({
      user_id: userId,
      name: 'Smoke Project',
      color: '#5b79a1',
      area_id: area.id,
      sort_order: 0,
    })
    .select()
    .single()
  if (projectError) throw projectError

  const { data: heading, error: headingError } = await adminClient
    .from('project_headings')
    .insert({
      user_id: userId,
      project_id: project.id,
      name: 'Smoke Section',
      sort_order: 0,
    })
    .select()
    .single()
  if (headingError) throw headingError

  const { data: label, error: labelError } = await adminClient
    .from('labels')
    .insert({
      user_id: userId,
      name: 'Smoke Label',
      color: '#a855f7',
    })
    .select()
    .single()
  if (labelError) throw labelError

  const { data: tasks, error: tasksError } = await adminClient
    .from('tasks')
    .insert([
      {
        user_id: userId,
        title: 'SMOKE - Inbox abierta',
        status: 'open',
        priority: 1,
      },
      {
        user_id: userId,
        title: 'SMOKE - Proyecto hoy',
        status: 'open',
        project_id: project.id,
        area_id: area.id,
        heading_id: heading.id,
        due_at: today.toISOString(),
        priority: 2,
      },
      {
        user_id: userId,
        title: 'SMOKE - Mañana',
        status: 'open',
        due_at: tomorrow.toISOString(),
        priority: 0,
      },
      {
        user_id: userId,
        title: 'SMOKE - Ya completada',
        status: 'done',
        project_id: project.id,
        completed_at: today.toISOString(),
        priority: 0,
      },
    ])
    .select()
  if (tasksError || !tasks) {
    throw tasksError ?? new Error('No se pudieron crear las tareas')
  }

  const inboxTask = tasks.find(task => task.title === 'SMOKE - Inbox abierta')
  if (inboxTask && label) {
    await adminClient.from('task_labels').insert({
      task_id: inboxTask.id,
      label_id: label.id,
    })
  }

  const checklistParent = tasks.find(task => task.title === 'SMOKE - Proyecto hoy')
  if (checklistParent) {
    await adminClient.from('task_checklist_items').insert([
      {
        user_id: userId,
        task_id: checklistParent.id,
        text: 'Primer paso',
        completed: false,
        sort_order: 0,
      },
      {
        user_id: userId,
        task_id: checklistParent.id,
        text: 'Listo',
        completed: true,
        sort_order: 1,
      },
    ])
  }
}

async function main() {
  console.log('🌱 Reiniciando usuario y sembrando datos de smoke test...')
  const userId = await recreateTestUser()
  await seedData(userId)
  console.log('✅ Seed listo para e2e: credenciales', TEST_EMAIL, '/', TEST_PASSWORD)
}

main().catch((error) => {
  console.error('❌ Error en seed:', error)
  process.exit(1)
})
