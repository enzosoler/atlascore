// Audit Log API - Atlas Core
// Query audit logs with filtering

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

    // Check permission
    const { data: hasPermission, error: permError } = await supabaseClient.rpc('has_permission', {
      user_uuid: user.id,
      perm_name: 'view_audit_logs',
    });

    if (permError || !hasPermission) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // ROUTE: GET /admin/audit-logs - Query audit logs
    if (method === 'GET' && path.endsWith('/admin/audit-logs')) {
      const params = url.searchParams;
      
      let query = supabaseClient
        .from('admin_action_logs')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (params.get('actor_id')) {
        query = query.eq('actor_id', params.get('actor_id'));
      }
      if (params.get('target_user_id')) {
        query = query.eq('target_user_id', params.get('target_user_id'));
      }
      if (params.get('resource_type')) {
        query = query.eq('resource_type', params.get('resource_type'));
      }
      if (params.get('action')) {
        query = query.eq('action', params.get('action'));
      }
      if (params.get('severity')) {
        query = query.eq('severity', params.get('severity'));
      }
      if (params.get('date_from')) {
        query = query.gte('created_at', params.get('date_from'));
      }
      if (params.get('date_to')) {
        query = query.lte('created_at', params.get('date_to'));
      }

      // Pagination
      const limit = Math.min(parseInt(params.get('limit') || '50'), 100);
      const offset = parseInt(params.get('offset') || '0');
      query = query.range(offset, offset + limit - 1);

      const { data: logs, error, count } = await query;

      if (error) throw error;

      return new Response(JSON.stringify({ logs, count, limit, offset }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ROUTE: GET /admin/audit-logs/my-actions - Current user actions
    if (method === 'GET' && path.endsWith('/admin/audit-logs/my-actions')) {
      const params = url.searchParams;
      const limit = Math.min(parseInt(params.get('limit') || '50'), 100);

      const { data: logs, error } = await supabaseClient
        .from('admin_action_logs')
        .select('*')
        .eq('actor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return new Response(JSON.stringify({ logs }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ROUTE: GET /admin/audit-logs/stats - Statistics
    if (method === 'GET' && path.endsWith('/admin/audit-logs/stats')) {
      const { data: stats, error } = await supabaseClient.rpc('get_audit_stats', {
        days: 30,
      });

      if (error) throw error;

      return new Response(JSON.stringify({ stats }), {
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
