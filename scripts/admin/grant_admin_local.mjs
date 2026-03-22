import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables!')
  console.error('Make sure .env.local has:')
  console.error('  VITE_SUPABASE_URL=...')
  console.error('  SUPABASE_SERVICE_ROLE_KEY=...')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function grantAdmin() {
  try {
    console.log('🔐 Granting admin role to inbox@enzosoler.com...\n')
    
    // Get all users to find the one with this email
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('❌ Error listing users:', usersError)
      process.exit(1)
    }
    
    console.log(`✓ Found ${users.users.length} user(s) in Supabase`)
    
    const user = users.users.find(u => u.email === 'inbox@enzosoler.com')
    
    if (!user) {
      console.error('❌ User inbox@enzosoler.com not found')
      console.log('\nRegistered users:')
      users.users.forEach(u => console.log(`  - ${u.email}`))
      process.exit(1)
    }
    
    console.log(`✓ Found user: ${user.id}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Created: ${user.created_at}\n`)
    
    // Update the profile to set role as admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, role: 'admin' }, { onConflict: 'id' })
      .select()
    
    if (profileError) {
      console.error('❌ Error updating profile:', profileError)
      process.exit(1)
    }
    
    console.log('✓ Admin role granted successfully!')
    console.log('  Profile ID:', profile[0]?.id)
    console.log('  Role:', profile[0]?.role)
    console.log('  Created:', profile[0]?.created_at)
    console.log('  Updated:', profile[0]?.updated_at)
    
    // Verify
    const { data: verified, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
    
    if (verifyError) {
      console.error('❌ Error verifying:', verifyError)
      process.exit(1)
    }
    
    console.log('\n✅ Verification successful!')
    console.log('   User inbox@enzosoler.com is now an admin!\n')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

grantAdmin()
