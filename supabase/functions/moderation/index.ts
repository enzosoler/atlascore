// Moderation API - Atlas Core
// Photo moderation and case management

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { buildPreflightResponse, getCorsHeaders } from '../_shared/cors.ts';


Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return buildPreflightResponse(req);
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

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

    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || 'unknown';

    // ROUTE: GET /moderation/queue - Get reported content queue
    if (method === 'GET' && path.endsWith('/moderation/queue')) {
      if (!await hasPermission('view_reported_photos')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const params = url.searchParams;
      let query = supabaseClient
        .from('reported_photos_queue')
        .select('*');

      // Apply filters
      if (params.get('category')) {
        query = query.eq('category', params.get('category'));
      }
      if (params.get('case_status')) {
        query = query.eq('case_status', params.get('case_status'));
      }
      if (params.get('priority')) {
        query = query.eq('priority', params.get('priority'));
      }
      if (params.get('assigned_to') === 'me') {
        query = query.eq('assigned_to', user.id);
      }

      const limit = Math.min(parseInt(params.get('limit') || '50'), 100);
      query = query.limit(limit);

      const { data: queue, error } = await query;

      if (error) throw error;

      return new Response(JSON.stringify({ queue }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ROUTE: GET /moderation/photos/:id - Get photo detail (logs access)
    if (method === 'GET' && path.match(/\/moderation\/photos\/[^\/]+$/)) {
      const photoId = path.split('/').pop();

      // Check permission and log access
      const canViewReported = await hasPermission('view_reported_photos');
      const canViewAll = await hasPermission('view_all_photos');

      if (!canViewReported && !canViewAll) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: photo, error } = await supabaseClient
        .from('photos')
        .select('*, profiles:user_id(full_name, email)')
        .eq('id', photoId)
        .single();

      if (error) throw error;

      // Check if photo is private/progress/health and needs extra permission
      if ((photo.category === 'progress' || photo.category === 'health') && !await hasPermission('view_private_photos')) {
        return new Response(JSON.stringify({ error: 'Forbidden - requires view_private_photos permission' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Log the access
      await supabaseClient.rpc('log_photo_access', {
        p_viewer_id: user.id,
        p_photo_id: photoId,
        p_reason: url.searchParams.get('reason') || 'review',
        p_reason_detail: url.searchParams.get('reason_detail') || '',
      });

      // Get related cases
      const { data: cases } = await supabaseClient
        .from('moderation_cases')
        .select('*')
        .eq('reported_content_id', photoId)
        .eq('reported_content_type', 'photo')
        .order('created_at', { ascending: false });

      return new Response(JSON.stringify({ photo, cases }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ROUTE: POST /moderation/photos/:id/action - Take moderation action
    if (method === 'POST' && path.match(/\/moderation\/photos\/[^\/]+\/action$/)) {
      const photoId = path.split('/').slice(-2)[0];

      if (!await hasPermission('moderate_photos')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { action, reason, case_id, internal_notes } = await req.json();

      if (!action || !reason) {
        return new Response(JSON.stringify({ error: 'Action and reason are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get current photo state
      const { data: photo, error: photoError } = await supabaseClient
        .from('photos')
        .select('*')
        .eq('id', photoId)
        .single();

      if (photoError) throw photoError;

      // Get moderator role
      const { data: roleData } = await supabaseClient
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', user.id)
        .is('revoked_at', null)
        .limit(1)
        .single();

      const roleName = roleData?.roles?.name || 'unknown';

      // Execute action
      let newStatus = photo.status;
      let newModerationStatus = photo.moderation_status;
      let userAction = null;

      switch (action) {
        case 'keep':
          newModerationStatus = 'approved';
          break;
        case 'remove':
          if (!await hasPermission('remove_photos')) {
            return new Response(JSON.stringify({ error: 'Forbidden - requires remove_photos permission' }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          newStatus = 'removed';
          newModerationStatus = 'rejected';
          break;
        case 'hide':
          newStatus = 'hidden';
          break;
        case 'restore':
          newStatus = 'active';
          newModerationStatus = 'approved';
          break;
        case 'warn':
        case 'suspend':
        case 'ban':
          userAction = action;
          break;
      }

      // Update photo
      const { error: updateError } = await supabaseClient
        .from('photos')
        .update({
          status: newStatus,
          moderation_status: newModerationStatus,
          last_reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq('id', photoId);

      if (updateError) throw updateError;

      // Create or update moderation case
      if (case_id) {
        await supabaseClient
          .from('moderation_cases')
          .update({
            status: action === 'escalate' ? 'escalated' : 'resolved',
            resolution: action,
            resolved_at: new Date().toISOString(),
            resolved_by: user.id,
          })
          .eq('id', case_id);
      }

      // Log moderation action
      await supabaseClient.from('moderation_actions').insert({
        case_id: case_id,
        moderator_id: user.id,
        moderator_role: roleName,
        action: action,
        action_category: 'photo',
        target_user_id: photo.user_id,
        target_photo_id: photoId,
        reason: reason,
        internal_notes: internal_notes,
        ip_address: ipAddress,
      });

      // Execute user actions if needed
      if (userAction === 'suspend' && await hasPermission('suspend_users')) {
        await supabaseClient.auth.admin.updateUserById(photo.user_id, {
          banned_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      if (userAction === 'ban' && await hasPermission('ban_users')) {
        await supabaseClient.auth.admin.updateUserById(photo.user_id, {
          banned_until: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        });
        await supabaseClient.from('user_flags').insert({
          user_id: photo.user_id,
          flag_type: 'banned',
          flag_reason: reason,
        });
      }

      return new Response(JSON.stringify({ success: true, action, photo_id: photoId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ROUTE: GET /moderation/cases - List moderation cases
    if (method === 'GET' && path.endsWith('/moderation/cases')) {
      if (!await hasPermission('view_reported_photos')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const params = url.searchParams;
      let query = supabaseClient
        .from('moderation_cases')
        .select('*, target:target_user_id(email, raw_user_meta_data), reporter:reporter_id(email), assigned:assigned_to(email)')
        .order('created_at', { ascending: false });

      if (params.get('status')) {
        query = query.eq('status', params.get('status'));
      }
      if (params.get('priority')) {
        query = query.eq('priority', params.get('priority'));
      }
      if (params.get('assigned_to') === 'me') {
        query = query.eq('assigned_to', user.id);
      }
      if (params.get('assigned_to') === 'unassigned') {
        query = query.is('assigned_to', null);
      }

      const limit = Math.min(parseInt(params.get('limit') || '50'), 100);
      query = query.limit(limit);

      const { data: cases, error } = await query;

      if (error) throw error;

      return new Response(JSON.stringify({ cases }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ROUTE: POST /moderation/cases/:id/assign - Assign case
    if (method === 'POST' && path.match(/\/moderation\/cases\/[^\/]+\/assign$/)) {
      const caseId = path.split('/').slice(-2)[0];

      if (!await hasPermission('moderate_photos')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabaseClient
        .from('moderation_cases')
        .update({
          assigned_to: user.id,
          assigned_at: new Date().toISOString(),
        })
        .eq('id', caseId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
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
