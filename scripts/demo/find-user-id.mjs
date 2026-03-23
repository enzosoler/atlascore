#!/usr/bin/env node

import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  ''
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function findUserId() {
  const email = process.argv[2] || 'inbox@enzosoler.com'
  
  console.log(`🔍 Searching for user ID for email: ${email}`)
  
  try {
    // Search in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      process.exit(1)
    }
    
    const user = authUsers.users.find(u => u.email === email)
    
    if (user) {
      console.log(`✅ Found user:`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Created: ${user.created_at}`)
      console.log(`   Last sign in: ${user.last_sign_in_at}`)
      
      console.log(`\n🚀 Use this command to seed Enzo's data:`)
      console.log(`export SEED_USER_ID="${user.id}"`)
      console.log(`npm run seed:enzo`)
      
      return user.id
    } else {
      console.log(`❌ No user found with email: ${email}`)
      
      // Try to find in profiles table as fallback
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('full_name', '%Enzo%')
      
      if (!profileError && profiles.length > 0) {
        console.log(`\n📝 Found profiles with "Enzo" in name:`)
        profiles.forEach(profile => {
          console.log(`   ID: ${profile.id}`)
          console.log(`   Name: ${profile.full_name || 'N/A'}`)
          console.log(`   Role: ${profile.role}`)
          console.log(`   Created: ${profile.created_at}`)
          console.log('')
        })
      }
      
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

findUserId()
