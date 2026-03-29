// Admin Users API - Atlas Core
// Handles user management operations with audit logging

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': getAllowedOrigin(),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getAllowedOrigin(): string {
  const requestOrigin = '';
  const appUrl = Deno.env.get('APP_URL') || 'https://useatlascore.com';
  const appUrls = Deno.env.get('APP_URLS') || '';
  
  const allowedList = [
    appUrl,
    ...appUrls.split(',').map(u => u.trim()).filter(Boolean),
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
  ];
  
  return allowedList.includes(requestOrigin) ? requestOrigin : appUrl;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get current user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // Check permissions helper
    const hasPermission = async (permissionName) => {
      const { data, error } = await supabaseClient.rpc('has_permission', {
        user_uuid: user.id,
        perm_name: permissionName,
      });
      return data === true;
    };

    // Log admin action helper
    const logAction = async (action, resourceType, resourceId, targetUserId, reason, beforeState, afterState, severity = 'info') => {
      const { data: roleData } = await supabaseClient
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', user.id)
        .is('revoked_at', null)
        .limit(1)
        .single();

      const roleName = roleData?.roles?.name || 'unknown';

      await supabaseClient.rpc('log_admin_action', {
        p_actor_id: user.id,
        p_actor_role: roleName,
        p_actor_ip: req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || 'unknown',
        p_target_user_id: targetUserId,
        p_resource_type: resourceType,
        p_resource_id: resourceId,
        p_action: action,
        p_action_category: 'users',
        p_reason: reason,
        p_before_state: beforeState,
        p_after_state: afterState,
        p_severity: severity,
        p_user_visible: severity === 'critical',
      });
    };

    // ROUTE: GET /admin/users - List users
    if (method === 'GET' && path.endsWith('/admin/users')) {
      if (!await hasPermission('manage_users')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: users, error } = await supabaseClient
        .from('user_admin_summary')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ROUTE: GET /admin/users/:id - Get user detail
    if (method === 'GET' && path.match(/\/admin\/users\/[^\/]+$/)) {
      if (!await hasPermission('manage_users')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const userId = path.split('/').pop();

      const { data: userData, error } = await supabaseClient
        .from('user_admin_summary')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Get subscription info
      const { data: subscription } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get internal notes
      const { data: notes } = await supabaseClient
        .from('internal_notes')
        .select('*')
        .eq('target_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      return new Response(JSON.stringify({ user: userData, subscription, notes }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ROUTE: POST /admin/users/:id/suspend - Suspend user
    if (method === 'POST' && path.endsWith('/suspend')) {
      if (!await hasPermission('suspend_users')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const userId = path.split('/').slice(-2)[0];
      const { reason, duration_days } = await req.json();

      const { data: targetUser, error: fetchError } = await supabaseClient.auth.admin.getUserById(userId);
      if (fetchError) throw fetchError;

      const beforeState = { banned_until: targetUser.user.banned_until };

      // Ban the user
      const bannedUntil = duration_days
        ? new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // Default 1 year

      const { error: banError } = await supabaseClient.auth.admin.updateUserById(userId, {
        banned_until: bannedUntil,
      });

      if (banError) throw banError;

      // Add user flag
      await supabaseClient.from('user_flags').insert({
        user_id: userId,
        flag_type: 'suspended',
        flag_reason: reason,
      });

      await logAction(
        'suspend',
        'user',
        userId,
        userId,
        reason,
        beforeState,
        { banned_until: bannedUntil, reason },
        'critical'
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ROUTE: POST /admin/users/:id/unsuspend - Lift suspension
    if (method === 'POST' && path.endsWith('/unsuspend')) {
      if (!await hasPermission('suspend_users')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const userId = path.split('/').slice(-2)[0];
      const { reason } = await req.json();

      const { data: targetUser, error: fetchError } = await supabaseClient.auth.admin.getUserById(userId);
      if (fetchError) throw fetchError;

      const beforeState = { banned_until: targetUser.user.banned_until };

      const { error: unbanError } = await supabaseClient.auth.admin.updateUserById(userId, {
        banned_until: null,
      });

      if (unbanError) throw unbanError;

      // Resolve the suspension flag
      await supabaseClient
        .from('user_flags')
        .update({ resolved_at: new Date().toISOString(), resolved_by: user.id })
        .eq('user_id', userId)
        .eq('flag_type', 'suspended')
        .is('resolved_at', null);

      await logAction(
        'unsuspend',
        'user',
        userId,
        userId,
        reason,
        beforeState,
        { banned_until: null, reason },
        'critical'
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ROUTE: POST /admin/users/:id/revoke-sessions - Force logout
    if (method === 'POST' && path.endsWith('/revoke-sessions')) {
      if (!await hasPermission('revoke_sessions')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const userId = path.split('/').slice(-2)[0];
      const { reason } = await req.json();

      const { error } = await supabaseClient.auth.admin.signOut(userId);
      if (error) throw error;

      await logAction(
        'revoke_sessions',
        'user',
        userId,
        userId,
        reason,
        null,
        { sessions_revoked: true },
        'warning'
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ROUTE: POST /admin/users/:id/reset-onboarding - Reset onboarding
    if (method === 'POST' && path.endsWith('/reset-onboarding')) {
      if (!await hasPermission('reset_onboarding')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const userId = path.split('/').slice(-2)[0];
      const { reason } = await req.json();

      const { error } = await supabaseClient
        .from('profiles')
        .update({ onboarding_completed: false, onboarding_step: null })
        .eq('id', userId);

      if (error) throw error;

      await logAction(
        'reset_onboarding',
        'user',
        userId,
        userId,
        reason,
        { onboarding_completed: true },
        { onboarding_completed: false },
        'info'
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ROUTE: POST /admin/users/:id/notes - Add internal note
    if (method === 'POST' && path.endsWith('/notes')) {
      if (!await hasPermission('manage_users')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const userId = path.split('/').slice(-2)[0];
      const { content, note_type = 'general' } = await req.json();

      const { data: note, error } = await supabaseClient
        .from('internal_notes')
        .insert({
          target_user_id: userId,
          author_id: user.id,
          content,
          note_type,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ note }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
