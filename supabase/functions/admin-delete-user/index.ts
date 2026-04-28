/**
 * admin-delete-user — Permanently delete a user from auth.users and all cascaded data
 *
 * Auth: Admin-only (verified via JWT + profiles.role check)
 *
 * Body: { userId: string }
 *
 * This deletes the user from auth.users. All tables with
 * ON DELETE CASCADE will automatically clean up related rows.
 *
 * Deploy:
 *   supabase functions deploy admin-delete-user
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildPreflightResponse, getCorsHeaders } from '../_shared/cors.ts';


serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return buildPreflightResponse(req);
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_ANON_KEY') || '',
    { global: { headers: { Authorization: authHeader } } }
  );

  // Verify caller is authenticated
  const { data: { user: caller }, error: authError } = await supabaseUser.auth.getUser();
  if (authError || !caller) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Verify caller is admin
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', caller.id)
    .single();

  if (profile?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Forbidden — admin only' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: { userId: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { userId } = body;

  if (!userId || typeof userId !== 'string') {
    return new Response(JSON.stringify({ error: 'userId is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Prevent self-deletion
  if (userId === caller.id) {
    return new Response(JSON.stringify({ error: 'Cannot delete your own account' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get user info before deletion for audit log
  const { data: targetProfile } = await supabaseAdmin
    .from('profiles')
    .select('email, full_name, role')
    .eq('id', userId)
    .single();

  if (!targetProfile) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Prevent deleting other admins
  if (targetProfile.role === 'admin') {
    return new Response(JSON.stringify({ error: 'Cannot delete admin accounts' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Delete from auth.users — cascades to profiles and all related tables
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (deleteError) {
    console.error('admin-delete-user: Failed to delete:', deleteError);
    return new Response(JSON.stringify({ error: deleteError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Log the deletion (audit)
  try {
    await supabaseAdmin.from('admin_audit_logs').insert({
      actor_id: caller.id,
      target_user_id: userId,
      action_type: 'user.deleted',
      action_detail: {
        email: targetProfile.email,
        full_name: targetProfile.full_name,
      },
    });
  } catch (e) {
    console.warn('admin-delete-user: Audit log failed:', e);
  }

  console.log(`admin-delete-user: User ${userId} (${targetProfile.email}) deleted by ${caller.id}`);

  return new Response(JSON.stringify({ success: true, deletedUserId: userId }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
