import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  try {
    const { data: { user } } = await req.json();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'No user provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Create profile with role = 'user'
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        role: 'user',
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }

    // 2. Create subscription with 7-day trial
    const trialStartsAt = new Date();
    const trialEndsAt = new Date(trialStartsAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        tier: 'free',
        status: 'trialing',
        trial_starts_at: trialStartsAt.toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
      });

    if (subscriptionError) {
      console.error('Subscription creation error:', subscriptionError);
      throw subscriptionError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Profile and subscription created',
        user_id: user.id,
        trial_ends_at: trialEndsAt.toISOString(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
