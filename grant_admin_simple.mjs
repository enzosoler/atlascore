#!/usr/bin/env node

const supabaseUrl = process.argv[2]
const serviceRoleKey = process.argv[3]

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing arguments!')
  console.error('Usage: node grant_admin_simple.mjs <SUPABASE_URL> <SERVICE_ROLE_KEY>')
  console.error('\nExample:')
  console.error('  node grant_admin_simple.mjs "https://xrytqwdpjzgdomqebmfkk.supabase.co" "eyJhbGc..."')
  process.exit(1)
}

async function grantAdmin() {
  try {
    console.log('🔐 Granting admin role to inbox@enzosoler.com...\n')
    
    // Step 1: List all users
    console.log('Step 1: Fetching users from Supabase...')
    const listUsersResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!listUsersResponse.ok) {
      console.error(`❌ Error: ${listUsersResponse.status} ${listUsersResponse.statusText}`)
      const errorText = await listUsersResponse.text()
      console.error('Response:', errorText)
      process.exit(1)
    }
    
    const usersData = await listUsersResponse.json()
    console.log(`✓ Found ${usersData.users.length} user(s)\n`)
    
    const user = usersData.users.find(u => u.email === 'inbox@enzosoler.com')
    
    if (!user) {
      console.error('❌ User inbox@enzosoler.com not found')
      console.log('Registered users:')
      usersData.users.forEach(u => console.log(`  - ${u.email}`))
      process.exit(1)
    }
    
    console.log(`Step 2: Found user: ${user.id}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Created: ${user.created_at}\n`)
    
    // Step 2: Update profile with admin role
    console.log('Step 3: Granting admin role...')
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: user.id,
        role: 'admin'
      })
    })
    
    if (!updateResponse.ok) {
      console.error(`❌ Error: ${updateResponse.status} ${updateResponse.statusText}`)
      const errorText = await updateResponse.text()
      console.error('Response:', errorText)
      process.exit(1)
    }
    
    console.log('✓ Admin role granted!\n')
    
    // Step 3: Verify
    console.log('Step 4: Verifying...')
    const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!verifyResponse.ok) {
      console.error(`❌ Error: ${verifyResponse.status} ${verifyResponse.statusText}`)
      process.exit(1)
    }
    
    const profiles = await verifyResponse.json()
    const profile = profiles[0]
    
    console.log('✓ Verification successful!')
    console.log(`  Profile ID: ${profile.id}`)
    console.log(`  Role: ${profile.role}`)
    console.log(`  Created: ${profile.created_at}`)
    console.log(`  Updated: ${profile.updated_at}`)
    console.log('\n✅ User inbox@enzosoler.com is now an admin!\n')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

grantAdmin()
