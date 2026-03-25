/**
 * Sync Profile Role to JWT - Update user app_metadata with profile role
 * 
 * This function updates the user's app_metadata with their role from the profiles table.
 * It's called when the profile role is updated, ensuring the JWT token includes the correct role.
 * 
 * Usage: Called from database trigger or manually via API
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

interface SyncRoleRequest {
  user_id: string;
  role?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    // Only allow POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const body: SyncRoleRequest = await req.json();
    const { user_id, role } = body;

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Fetch user to get current app_metadata
    const { data: { user }, error: fetchError } = await adminClient.auth.admin.getUserById(user_id);

    if (fetchError || !user) {
      console.error('Failed to fetch user:', fetchError?.message);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    // Determine role to set
    let roleToSet = role;

    // If role not provided, fetch from profiles table
    if (!roleToSet) {
      const { data: profile, error: profileError } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user_id)
        .single();

      if (profileError) {
        console.warn('Failed to fetch profile role:', profileError.message);
        roleToSet = 'athlete'; // Default fallback
      } else {
        roleToSet = profile?.role || 'athlete';
      }
    }

    // Normalize role
    const validRoles = ['visitor', 'athlete', 'coach', 'nutritionist', 'clinician', 'admin'];
    const normalizedRole = roleToSet?.toLowerCase() || 'athlete';
    if (!validRoles.includes(normalizedRole)) {
      console.warn(`Invalid role: ${normalizedRole}, defaulting to athlete`);
      roleToSet = 'athlete';
    }

    // Update app_metadata with atlas_role
    const { error: updateError } = await adminClient.auth.admin.updateUserById(user_id, {
      app_metadata: {
        ...user.app_metadata,
        atlas_role: roleToSet,
      },
    });

    if (updateError) {
      console.error('Failed to update user app_metadata:', updateError.message);
      return new Response(
        JSON.stringify({ error: 'Failed to update user metadata', details: updateError.message }),
        { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully synced role "${roleToSet}" to user ${user_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Role synced to user ${user_id}`,
        role: roleToSet,
      }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
});
