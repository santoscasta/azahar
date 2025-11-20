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
  console.error('❌ Faltan variables: define VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para limpiar datos.')
  process.exit(1)
}

const TEST_EMAIL = 'test@azahar.app'

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function reset() {
  console.log('🧹 Eliminando usuario y datos de prueba...')
  const { data: existingUsers, error: listError } = await adminClient.auth.admin.listUsers({ email: TEST_EMAIL })
  if (listError) {
    throw listError
  }
  const current = existingUsers.users?.[0]
  if (!current) {
    console.log('No hay usuario de prueba; nada que limpiar.')
    return
  }

  await adminClient.auth.admin.deleteUser(current.id)
  console.log('✅ Usuario y datos asociados eliminados')
}

reset().catch((error) => {
  console.error('❌ Error al limpiar:', error)
  process.exit(1)
})
