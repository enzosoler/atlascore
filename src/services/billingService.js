import { supabase } from '@/lib/supabaseClient';

function getOrigin() {
  return typeof window !== 'undefined' ? window.location.origin : 'https://useatlascore.com';
}

async function getAccessToken() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('You must be signed in to manage billing.');
  }
  return session.access_token;
}

function authHeaders(accessToken) {
  return { Authorization: `Bearer ${accessToken}` };
}

export async function startWebCheckout({
  userId,
  email,
  billing = 'yearly',
  region = 'us',
  plan = 'athlete_pro',
} = {}) {
  const accessToken = await getAccessToken();
  const origin = getOrigin();
  const successUrl = `${origin}/webapp/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/app/billing/paywall`;

  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: {
      plan,
      billing,
      region,
      user_id: userId,
      email,
      success_url: successUrl,
      cancel_url: cancelUrl,
    },
    headers: authHeaders(accessToken),
  });

  if (error) {
    throw new Error(error.message || 'Could not start checkout.');
  }
  if (!data?.url) {
    throw new Error(data?.error || 'Checkout URL was not returned.');
  }

  return data.url;
}

export async function openWebBillingPortal(returnUrl) {
  const accessToken = await getAccessToken();
  const { data, error } = await supabase.functions.invoke('create-customer-portal', {
    body: {
      return_url: returnUrl || `${getOrigin()}/app/billing`,
    },
    headers: authHeaders(accessToken),
  });

  if (error) {
    throw new Error(error.message || 'Could not open billing portal.');
  }
  if (!data?.url) {
    throw new Error(data?.error || 'Billing portal URL was not returned.');
  }

  window.location.href = data.url;
}

export async function completeWebCheckout(sessionId) {
  const accessToken = await getAccessToken();
  const { data, error } = await supabase.functions.invoke('complete-checkout', {
    body: { session_id: sessionId },
    headers: authHeaders(accessToken),
  });

  if (error) {
    throw new Error(error.message || 'Could not confirm checkout.');
  }

  return data;
}

export async function listBillingSubscriptions(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}
