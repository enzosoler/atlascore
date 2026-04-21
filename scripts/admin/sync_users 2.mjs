import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xrtqwdpczgdomqebmfkk.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function syncUsers() {
  try {
    console.log('🔄 Syncing users to profiles and subscriptions tables...\n')
    
    // 1. Get all users from auth.users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
    if (usersError) throw usersError
    
    console.log(`Found ${users.length} users in auth.users`)
    
    for (const user of users) {
      console.log(`Processing ${user.email} (${user.id})...`)
      
      // 2. Ensure profile exists
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          role: user.email === 'inbox@enzosoler.com' ? 'admin' : 'user'
        }, { onConflict: 'id' })
      
      if (profileError) console.error(`  Error upserting profile for ${user.email}:`, profileError.message)
      else console.log(`  ✓ Profile synced`)
      
      // 3. Ensure subscription exists
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (!existingSub) {
        const { error: subError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            tier: 'free',
            status: 'trialing',
            trial_starts_at: user.created_at,
            trial_ends_at: new Date(new Date(user.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
          })
        
        if (subError) console.error(`  Error creating subscription for ${user.email}:`, subError.message)
        else console.log(`  ✓ Subscription created (7-day trial)`)
      } else {
        console.log(`  ✓ Subscription already exists`)
      }
    }
    
    console.log('\n✅ Sync complete!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

syncUsers()
