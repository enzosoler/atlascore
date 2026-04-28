// Terms Acceptance API - Atlas Core
// Handles terms acceptance tracking for signup and billing

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { getCorsHeaders, buildPreflightResponse } from '../_shared/cors.ts';

const CURRENT_TERMS_VERSION = 'v2.1.0';
const CURRENT_PRIVACY_VERSION = 'v1.3.0';
const CURRENT_BILLING_TERMS_VERSION = 'v1.0.0';

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return buildPreflightResponse(req);
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // Get client IP and user agent
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr');
    const userAgent = req.headers.get('user-agent');

    // ROUTE: POST /terms/accept-signup - Accept signup terms (public, no auth required)
    if (method === 'POST' && path.endsWith('/terms/accept-signup')) {
      const { user_id } = await req.json();

      if (!user_id) {
        return new Response(JSON.stringify({ error: 'User ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabaseClient
        .from('terms_acceptances')
        .insert({
          user_id,
          accepted_terms_at: new Date().toISOString(),
          terms_version: CURRENT_TERMS_VERSION,
          accepted_privacy_at: new Date().toISOString(),
          privacy_version: CURRENT_PRIVACY_VERSION,
          ip_address: ipAddress,
          user_agent: userAgent,
        })
        .select()
        .single();

      if (error) {
        // If already exists, update it
        if (error.code === '23505') {
          const { data: updated, error: updateError } = await supabaseClient
            .from('terms_acceptances')
            .update({
              accepted_terms_at: new Date().toISOString(),
              terms_version: CURRENT_TERMS_VERSION,
              accepted_privacy_at: new Date().toISOString(),
              privacy_version: CURRENT_PRIVACY_VERSION,
              ip_address: ipAddress,
              user_agent: userAgent,
            })
            .eq('user_id', user_id)
            .select()
            .single();

          if (updateError) throw updateError;

          return new Response(JSON.stringify({ accepted: updated }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw error;
      }

      return new Response(JSON.stringify({ accepted: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ROUTE: POST /terms/accept-billing - Accept billing terms (requires auth)
    if (method === 'POST' && path.endsWith('/terms/accept-billing')) {
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

      const { data, error } = await supabaseClient
        .from('terms_acceptances')
        .upsert({
          user_id: user.id,
          accepted_billing_terms_at: new Date().toISOString(),
          billing_terms_version: CURRENT_BILLING_TERMS_VERSION,
          ip_address: ipAddress,
          user_agent: userAgent,
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ accepted: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ROUTE: GET /terms/status - Check acceptance status (requires auth)
    if (method === 'GET' && path.endsWith('/terms/status')) {
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

      const { data, error } = await supabaseClient
        .from('terms_acceptances')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      const status = {
        terms_accepted: !!data?.accepted_terms_at && data?.terms_version === CURRENT_TERMS_VERSION,
        privacy_accepted: !!data?.accepted_privacy_at && data?.privacy_version === CURRENT_PRIVACY_VERSION,
        billing_terms_accepted: !!data?.accepted_billing_terms_at && data?.billing_terms_version === CURRENT_BILLING_TERMS_VERSION,
        current_terms_version: CURRENT_TERMS_VERSION,
        current_privacy_version: CURRENT_PRIVACY_VERSION,
        current_billing_terms_version: CURRENT_BILLING_TERMS_VERSION,
        accepted_at: data?.accepted_terms_at,
        needs_reconsent: (
          (data?.accepted_terms_at && data?.terms_version !== CURRENT_TERMS_VERSION) ||
          (data?.accepted_privacy_at && data?.privacy_version !== CURRENT_PRIVACY_VERSION)
        ),
      };

      return new Response(JSON.stringify({ status, record: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ROUTE: POST /terms/re-consent - Re-consent to updated terms (requires auth)
    if (method === 'POST' && path.endsWith('/terms/re-consent')) {
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

      const { data, error } = await supabaseClient
        .from('terms_acceptances')
        .upsert({
          user_id: user.id,
          accepted_terms_at: new Date().toISOString(),
          terms_version: CURRENT_TERMS_VERSION,
          accepted_privacy_at: new Date().toISOString(),
          privacy_version: CURRENT_PRIVACY_VERSION,
          ip_address: ipAddress,
          user_agent: userAgent,
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ accepted: data }), {
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
