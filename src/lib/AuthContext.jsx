import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/lib/routes';
import { fetchProfileRole, normalizeAtlasRole } from '@/hooks/useRole';
import { sendWelcomeEmailAsync } from '@/lib/emailService';
import { setSentryUser, trackEvent } from '@/lib/sentry';

const AuthContext = createContext(null);

// Auth state machine: 'loading' | 'authenticated' | 'unauthenticated' | 'error'
const AUTH_STATES = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error',
};

const AUTH_CHECK_TIMEOUT = 5000;
const REVALIDATION_TIMEOUT = 15000;
const AUTH_BYPASS_STORAGE_KEY = 'atlas.authBypassUser';

function hasSupabaseConfig() {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
    (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
  );
}

function isAuthBypassEnabled() {
  return import.meta.env.VITE_ENABLE_AUTH_BYPASS === 'true';
}

function withTimeout(promise, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(`${label} timeout`)), AUTH_CHECK_TIMEOUT);
    }),
  ]);
}

function firstNonEmptyString(...values) {
  return values.find((value) => typeof value === 'string' && value.trim().length > 0) || null;
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
}

function normalizeSupabaseUser(authUser) {
  if (!authUser) return null;

  const userMetadata = authUser.user_metadata ?? {};
  const appMetadata = authUser.app_metadata ?? {};
  const email = authUser.email || firstNonEmptyString(userMetadata.email, appMetadata.email) || '';
  const fallbackName = email ? email.split('@')[0] : 'Athlete';
  const metadataAtlasRole = normalizeAtlasRole(
    firstNonEmptyString(
      userMetadata.atlas_role,
      appMetadata.atlas_role,
      userMetadata.role
    ),
    'athlete'
  );

  return {
    id: authUser.id,
    email,
    full_name:
      firstNonEmptyString(
        userMetadata.full_name,
        userMetadata.name,
        userMetadata.display_name,
        appMetadata.full_name
      ) || fallbackName,
    atlas_role: metadataAtlasRole,
    profile_role: null,
    // onboarding_completed is strictly resolved from DB later
    onboarding_completed: null, 
    role: firstNonEmptyString(appMetadata.role, userMetadata.role) || 'user',
    phone: authUser.phone || firstNonEmptyString(userMetadata.phone) || null,
    user_metadata: userMetadata,
    app_metadata: appMetadata,
    raw_user: authUser,
  };
}

function buildAuthError(type, message) {
  return {
    type,
    message: message || 'Authentication error',
  };
}

function parseRetryAfterSeconds(error) {
  const candidates = [
    error?.response?.headers?.get?.('retry-after'),
    error?.headers?.get?.('retry-after'),
    error?.headers?.['retry-after'],
    error?.response?.headers?.['retry-after'],
    error?.context?.retryAfter,
    error?.retryAfter,
  ];

  for (const candidate of candidates) {
    if (candidate == null || candidate === '') continue;
    const seconds = Number(candidate);
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.ceil(seconds);
    }

    const retryDate = Date.parse(String(candidate));
    if (!Number.isNaN(retryDate)) {
      const diffSeconds = Math.ceil((retryDate - Date.now()) / 1000);
      if (diffSeconds > 0) {
        return diffSeconds;
      }
    }
  }

  const rawMessage = String(error?.message || '');
  const match = rawMessage.match(/(?:retry after|try again in|available in)\s+(\d+)\s*(seconds?|secs?|s|minutes?|mins?|m)/i);
  if (match) {
    const amount = Number(match[1]);
    if (!Number.isFinite(amount) || amount <= 0) return null;
    const unit = match[2].toLowerCase();
    return unit.startsWith('m') ? amount * 60 : amount;
  }

  return null;
}

function normalizeAuthError(error, fallbackMessage) {
  const rawMessage = error?.message || '';

  if (error?.status === 429 || /rate limit|too many requests|too many attempts/i.test(rawMessage)) {
    return {
      ...buildAuthError('rate_limited', 'Too many attempts. Wait a moment and try again.'),
      retryAfterSeconds: parseRetryAfterSeconds(error) ?? 60,
      status: 429,
    };
  }

  if (/hook within maximum time|timeout/i.test(rawMessage)) {
    return buildAuthError('timeout', 'The auth service is taking too long to respond. Please try again.');
  }

  if (/network|failed to fetch/i.test(rawMessage)) {
    return buildAuthError('network', 'Network issue while contacting auth. Check your connection and retry.');
  }

  return buildAuthError('auth_failed', rawMessage || fallbackMessage);
}

function readAuthBypassUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_BYPASS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeAuthBypassUser(user) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(AUTH_BYPASS_STORAGE_KEY, JSON.stringify(user));
  } catch {}
}

function clearAuthBypassUser() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(AUTH_BYPASS_STORAGE_KEY);
  } catch {}
}

function createAuthBypassUser(email, { onboardingCompleted = false } = {}) {
  const normalizedEmail = String(email || 'dev-user@local.dev').trim().toLowerCase() || 'dev-user@local.dev';
  const seed = normalizedEmail.replace(/[^a-z0-9]+/g, '-');
  return {
    id: `local-${seed || 'dev-user'}`,
    email: normalizedEmail,
    full_name: normalizedEmail.split('@')[0] || 'Developer',
    atlas_role: 'athlete',
    profile_role: 'athlete',
    onboarding_completed: onboardingCompleted,
    role: 'user',
    phone: null,
    user_metadata: {
      full_name: normalizedEmail.split('@')[0] || 'Developer',
      onboarding_completed: onboardingCompleted,
      auth_bypass: true,
    },
    app_metadata: {},
    raw_user: {
      id: `local-${seed || 'dev-user'}`,
      email: normalizedEmail,
    },
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authState, setAuthState] = useState(AUTH_STATES.LOADING);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings] = useState(null);

  const hadAuthenticatedSessionRef = useRef(false);
  const logoutInProgressRef = useRef(false);
  const mountedRef = useRef(true);

  const clearAuthState = useCallback(() => {
    setUser(null);
    clearAuthBypassUser();

    try {
      const queryClient = window.__queryClient;
      if (queryClient) {
        queryClient.removeQueries();
      }
    } catch (error) {
      console.log('Query cache clear skipped');
    }

    if (typeof window === 'undefined') return;

    window.localStorage.removeItem('atlas_region');
    window.localStorage.removeItem('pending_plan');
    window.sessionStorage.clear();
  }, []);

  const applyAuthenticatedUser = useCallback(async (authUser, retryCount = 0) => {
    const normalizedUser = normalizeSupabaseUser(authUser);
    if (!normalizedUser) {
      return null;
    }

    let profileRole = normalizedUser?.atlas_role || 'athlete';
    let profileOnboardingCompleted = null; // Strict: start with null, no metadata fallback
    let profileSource = 'unknown';

    try {
      // Hard 3 s timeout — on slow mobile networks this query can hang indefinitely,
      // keeping authState at 'loading' forever and preventing the splash from hiding.
      const [role, profileRow] = await Promise.race([
        Promise.all([
          fetchProfileRole(authUser?.id, profileRole),
          supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', authUser?.id)
            .maybeSingle()
            .then(({ data, error }) => {
              if (error) throw error;
              return data;
            }),
        ]),
        new Promise((_, reject) =>
          window.setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
        ),
      ]);

      profileRole = role;

      // profiles table is the authoritative source for onboarding_completed
      if (profileRow && profileRow.onboarding_completed !== undefined) {
        profileOnboardingCompleted = normalizeBoolean(profileRow.onboarding_completed);
        profileSource = 'profiles_table';
      } else {
        // If row doesn't exist yet, it's effectively false (new user)
        profileOnboardingCompleted = false;
        profileSource = profileRow === null ? 'no_profile_row' : 'profile_row_missing_field';
      }
    } catch (e) {
      console.error('[AuthContext] Profile fetch failed:', e.message);
      
      if (retryCount < 2) {
        console.log(`[AuthContext] Retrying profile fetch (${retryCount + 1}/2)...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return applyAuthenticatedUser(authUser, retryCount + 1);
      }

      // If we've exhausted retries, we MUST NOT fallback to metadata.
      // We set authState to ERROR to prevent navigation to protected routes.
      setAuthState(AUTH_STATES.ERROR);
      setAuthError(buildAuthError('profile_fetch_failed', 'Could not load user profile from database. Please check your connection.'));
      return null;
    }

    const resolvedUser = {
      ...normalizedUser,
      atlas_role: profileRole,
      profile_role: profileRole,
      onboarding_completed: profileOnboardingCompleted,
    };

    console.log(
      '[AuthContext] user resolved from database',
      'id:', resolvedUser.id,
      '| onboarding_completed:', resolvedUser.onboarding_completed,
      '| source:', profileSource,
      '| role:', resolvedUser.atlas_role,
    );

    if (!mountedRef.current) {
      return resolvedUser;
    }

    hadAuthenticatedSessionRef.current = true;
    setUser(resolvedUser);
    setAuthState(AUTH_STATES.AUTHENTICATED);
    setAuthError(null);
    setSentryUser(resolvedUser);

    return resolvedUser;
  }, []);

  const applyLocalBypassUser = useCallback((mockUser) => {
    if (!mountedRef.current) {
      return mockUser;
    }

    writeAuthBypassUser(mockUser);
    hadAuthenticatedSessionRef.current = true;
    setUser(mockUser);
    setAuthState(AUTH_STATES.AUTHENTICATED);
    setAuthError(null);
    setSentryUser(mockUser);
    return mockUser;
  }, []);

  const applyUnauthenticatedState = useCallback(
    ({ markAuthRequired = false, clearClientState = false } = {}) => {
      if (clearClientState) {
        clearAuthState();
      } else {
        setUser(null);
      }

      hadAuthenticatedSessionRef.current = false;
      setAuthState(AUTH_STATES.UNAUTHENTICATED);
      setAuthError(
        markAuthRequired
          ? buildAuthError('auth_required', 'Session expired or invalid')
          : null
      );
    },
    [clearAuthState]
  );

  const handleAuthError = useCallback((error, { markAuthRequired = false } = {}) => {
    console.error('Auth flow failed:', error);

    if (markAuthRequired) {
      clearAuthState();
      hadAuthenticatedSessionRef.current = false;
      setAuthState(AUTH_STATES.UNAUTHENTICATED);
      setAuthError(buildAuthError('auth_required', error?.message || 'Session expired or invalid'));
      return;
    }

    setUser(null);
    setAuthState(AUTH_STATES.ERROR);
    setAuthError(buildAuthError('unknown', error?.message));
  }, [clearAuthState]);

  const checkAppState = useCallback(async () => {
    setAuthState(AUTH_STATES.LOADING);
    setAuthError(null);

    const bypassUser = isAuthBypassEnabled() ? readAuthBypassUser() : null;
    if (bypassUser) {
      return applyLocalBypassUser(bypassUser);
    }

    const isConfigured = hasSupabaseConfig();
    
    if (!isConfigured) {
      if (isAuthBypassEnabled()) {
        applyUnauthenticatedState();
        return null;
      }
      setAuthState(AUTH_STATES.ERROR);
      setAuthError(buildAuthError('missing_config', 'Supabase configuration is missing.'));
      return null;
    }

    try {
      const { data, error } = await withTimeout(supabase.auth.getSession(), 'Auth check');
      if (error) throw error;

      const sessionUser = data?.session?.user;
      if (sessionUser) {
        return await applyAuthenticatedUser(sessionUser);
      }

      applyUnauthenticatedState();
      return null;
    } catch (error) {
      handleAuthError(error);
      return null;
    }
  }, [applyAuthenticatedUser, applyLocalBypassUser, applyUnauthenticatedState, handleAuthError]);

  const revalidateSession = useCallback(async () => {
    const bypassUser = isAuthBypassEnabled() ? readAuthBypassUser() : null;
    if (bypassUser) {
      return applyLocalBypassUser(bypassUser);
    }

    const isConfigured = hasSupabaseConfig();
    if (!isConfigured) return null;

    try {
      const { data, error } = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) =>
          window.setTimeout(() => reject(new Error('Session revalidation timeout')), REVALIDATION_TIMEOUT)
        ),
      ]);
      if (error) throw error;

      const sessionUser = data?.session?.user;
      if (sessionUser) {
        return await applyAuthenticatedUser(sessionUser);
      }

      // Only log out if there was no previous session — avoids logging out on network failures
      if (!hadAuthenticatedSessionRef.current) {
        applyUnauthenticatedState();
      }
      return null;
    } catch (error) {
      // On timeout or network error, keep the user logged in — don't log out
      console.warn('[AuthContext] Session revalidation failed, keeping current state:', error?.message);
      return null;
    }
  }, [applyAuthenticatedUser, applyLocalBypassUser, applyUnauthenticatedState]);

  useEffect(() => {
    mountedRef.current = true;
    checkAppState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current) return;

      if (event === 'SIGNED_OUT') {
        const shouldRedirectToLogin = hadAuthenticatedSessionRef.current && !logoutInProgressRef.current;
        applyUnauthenticatedState({
          markAuthRequired: shouldRedirectToLogin,
          clearClientState: shouldRedirectToLogin,
        });
        logoutInProgressRef.current = false;
        return;
      }

      if (session?.user) {
        void applyAuthenticatedUser(session.user);
      }
    });

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        revalidateSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', revalidateSession);

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', revalidateSession);
    };
  }, [checkAppState, revalidateSession]);

  const signIn = useCallback(async (email, password) => {
    if (isAuthBypassEnabled()) {
      const mockUser = createAuthBypassUser(email, { onboardingCompleted: true });
      return applyLocalBypassUser(mockUser);
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        return await applyAuthenticatedUser(data.user);
      }
      return null;
    } catch (error) {
      const authError = normalizeAuthError(error, 'Could not sign you in.');
      setAuthState(AUTH_STATES.UNAUTHENTICATED);
      setAuthError(authError);
      throw authError;
    }
  }, [applyAuthenticatedUser, applyLocalBypassUser]);

  const signUp = useCallback(async (email, password, metadata = {}) => {
    if (isAuthBypassEnabled()) {
      const mockUser = createAuthBypassUser(email, { onboardingCompleted: false });
      return applyLocalBypassUser(mockUser);
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      if (error) throw error;

      if (data.user && data.session) {
        trackEvent('signup', { email });
        return await applyAuthenticatedUser(data.user);
      }

      return { needsEmailConfirmation: true };
    } catch (error) {
      const authError = normalizeAuthError(error, 'Could not create your account.');
      setAuthState(AUTH_STATES.UNAUTHENTICATED);
      setAuthError(authError);
      throw authError;
    }
  }, [applyAuthenticatedUser, applyLocalBypassUser]);

  const logout = useCallback(async () => {
    logoutInProgressRef.current = true;
    clearAuthState();
    hadAuthenticatedSessionRef.current = false;
    setAuthState(AUTH_STATES.UNAUTHENTICATED);
    setAuthError(null);
    setSentryUser(null);

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logoutInProgressRef.current = false;
      window.location.href = ROUTES.home;
    }
  }, [clearAuthState]);

  const navigateToLogin = useCallback(() => {
    const nextUrl = `${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.href = `/auth?mode=login&next=${encodeURIComponent(nextUrl)}`;
  }, []);

  const isLoadingAuth = authState === AUTH_STATES.LOADING;
  const isAuthenticated = authState === AUTH_STATES.AUTHENTICATED;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        authState,
        authError,
        appPublicSettings,
        signIn,
        signUp,
        logout,
        navigateToLogin,
        checkAppState,
        revalidateSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
