import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
dotenv.config({ path: path.resolve(__dirname, '../.env.seed'), override: false })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Faltan variables: define VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para crear usuario.')
  process.exit(1)
}

const AGENT_EMAIL = process.env.AGENT_TEST_EMAIL ?? 'agent@azahar.app'
const AGENT_PASSWORD = process.env.AGENT_TEST_PASSWORD ?? 'agent-mode-123'

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function recreateAgentUser() {
  const { data: existingUsers, error: listError } = await adminClient.auth.admin.listUsers({ email: AGENT_EMAIL })
  if (listError) {
    throw listError
  }

  const current = existingUsers.users?.[0]
  if (current) {
    await adminClient.auth.admin.deleteUser(current.id)
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email: AGENT_EMAIL,
    password: AGENT_PASSWORD,
    email_confirm: true,
  })

  if (error || !data.user) {
    throw error ?? new Error('No se pudo crear el usuario de modo agente')
  }
}

async function main() {
  console.log('🤖 Creando usuario de prueba para modo agente...')
  await recreateAgentUser()
  console.log('✅ Usuario agente listo:', AGENT_EMAIL, '/', AGENT_PASSWORD)
}

main().catch((error) => {
  console.error('❌ Error creando usuario agente:', error)
  process.exit(1)
})
