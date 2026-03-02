/**
 * Seed script for test accounts
 *
 * Creates 3 zones and 4 test users with different roles.
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 *
 * Usage: npx tsx scripts/seed-test-accounts.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

interface TestUser {
  email: string
  password: string
  role: string
  zoneName: string | null
  fullName: string
}

const ZONES = [
  { name: 'Norte', description: 'Zona norte de la ciudad' },
  { name: 'Sur', description: 'Zona sur de la ciudad' },
  { name: 'Centro', description: 'Zona centro de la ciudad' },
]

const TEST_USERS: TestUser[] = [
  { email: 'supervisor@test.com', password: 'test123456', role: 'supervisor', zoneName: null, fullName: 'Supervisor Test' },
  { email: 'coordinador@test.com', password: 'test123456', role: 'coordinador', zoneName: null, fullName: 'Coordinador Test' },
  { email: 'gestor@test.com', password: 'test123456', role: 'gestor', zoneName: 'Norte', fullName: 'Gestor Test' },
  { email: 'admin@test.com', password: 'test123456', role: 'administrador', zoneName: null, fullName: 'Admin Test' },
]

async function seed() {
  console.log('--- Seeding zones ---')

  const zoneMap: Record<string, string> = {}

  for (const zone of ZONES) {
    // Upsert zone by name
    const { data, error } = await supabase
      .from('zones')
      .upsert({ name: zone.name, description: zone.description }, { onConflict: 'name' })
      .select()
      .single()

    if (error) {
      console.error(`Error creating zone ${zone.name}:`, error.message)
      // Try to fetch existing
      const { data: existing } = await supabase
        .from('zones')
        .select('*')
        .eq('name', zone.name)
        .single()
      if (existing) {
        zoneMap[zone.name] = existing.id
        console.log(`  Zone "${zone.name}" already exists: ${existing.id}`)
      }
    } else {
      zoneMap[zone.name] = data.id
      console.log(`  Zone "${zone.name}" created: ${data.id}`)
    }
  }

  console.log('\n--- Seeding test users ---')

  for (const user of TEST_USERS) {
    // Create auth user via admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    })

    let userId: string

    if (authError) {
      if (authError.message?.includes('already been registered') || authError.message?.includes('already exists')) {
        console.log(`  User ${user.email} already exists, updating profile...`)
        // Fetch the existing user
        const { data: users } = await supabase.auth.admin.listUsers()
        const existing = users?.users?.find((u) => u.email === user.email)
        if (!existing) {
          console.error(`  Could not find existing user ${user.email}`)
          continue
        }
        userId = existing.id
      } else {
        console.error(`  Error creating user ${user.email}:`, authError.message)
        continue
      }
    } else {
      userId = authData.user.id
      console.log(`  User ${user.email} created: ${userId}`)
    }

    // Update profile with role and zone
    const zoneId = user.zoneName ? zoneMap[user.zoneName] ?? null : null

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: user.email,
        role: user.role,
        zone_id: zoneId,
        full_name: user.fullName,
      })

    if (profileError) {
      console.error(`  Error updating profile for ${user.email}:`, profileError.message)
    } else {
      console.log(`  Profile updated: ${user.email} → role=${user.role}${zoneId ? `, zone=${user.zoneName}` : ''}`)
    }
  }

  console.log('\n--- Seed complete ---')
  console.log('\nTest accounts:')
  for (const u of TEST_USERS) {
    console.log(`  ${u.email} / ${u.password} → ${u.role}${u.zoneName ? ` (zona ${u.zoneName})` : ''}`)
  }
}

seed().catch(console.error)
