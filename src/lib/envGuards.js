export function hasSupabaseConfigFromEnv(env = {}) {
  return Boolean(
    env.VITE_SUPABASE_URL &&
      (env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY)
  );
}

export function isAuthBypassEnabledFromEnv(env = {}) {
  return Boolean(env.DEV && env.VITE_ENABLE_AUTH_BYPASS === 'true');
}
