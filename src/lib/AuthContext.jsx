import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/lib/routes';

const AuthContext = createContext(null);

// Auth state machine: 'loading' | 'authenticated' | 'unauthenticated' | 'error'
const AUTH_STATES = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error',
};

const AUTH_CHECK_TIMEOUT = 5000;

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
    atlas_role:
      firstNonEmptyString(
        userMetadata.atlas_role,
        appMetadata.atlas_role,
        userMetadata.role
      ) || 'athlete',
    onboarding_completed: normalizeBoolean(userMetadata.onboarding_completed),
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

    try {
      const queryClient = window.__queryClient;
      if (queryClient) {
        queryClient.removeQueries();
      }
    } catch (error) {
      console.log('Query cache clear skipped');
    }

    if (typeof window === 'undefined') return;

    window.localStorage.removeItem('atlas_locale');
    window.localStorage.removeItem('atlas_region');
    window.localStorage.removeItem('pending_plan');
    window.sessionStorage.clear();
  }, []);

  const applyAuthenticatedUser = useCallback((authUser) => {
    const normalizedUser = normalizeSupabaseUser(authUser);

    hadAuthenticatedSessionRef.current = true;
    setUser(normalizedUser);
    setAuthState(AUTH_STATES.AUTHENTICATED);
    setAuthError(null);

    return normalizedUser;
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

    try {
      const { data, error } = await withTimeout(supabase.auth.getSession(), 'Auth check');
      if (error) throw error;

      const sessionUser = data?.session?.user;
      if (sessionUser) {
        return applyAuthenticatedUser(sessionUser);
      }

      applyUnauthenticatedState();
      return null;
    } catch (error) {
      handleAuthError(error);
      return null;
    }
  }, [applyAuthenticatedUser, applyUnauthenticatedState, handleAuthError]);

  const revalidateSession = useCallback(async () => {
    try {
      const { data, error } = await withTimeout(supabase.auth.getSession(), 'Session revalidation');
      if (error) throw error;

      const sessionUser = data?.session?.user;
      if (sessionUser) {
        return applyAuthenticatedUser(sessionUser);
      }

      applyUnauthenticatedState({
        markAuthRequired: hadAuthenticatedSessionRef.current,
        clearClientState: hadAuthenticatedSessionRef.current,
      });
      return null;
    } catch (error) {
      handleAuthError(error, { markAuthRequired: hadAuthenticatedSessionRef.current });
      return null;
    }
  }, [applyAuthenticatedUser, applyUnauthenticatedState, handleAuthError]);

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
        applyAuthenticatedUser(session.user);
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
  }, [applyAuthenticatedUser, applyUnauthenticatedState, checkAppState, revalidateSession]);

  const signIn = useCallback(async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) throw error;

    return applyAuthenticatedUser(data.user ?? data.session?.user);
  }, [applyAuthenticatedUser]);

  const signUp = useCallback(async ({ email, password, fullName }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: trimmedName || normalizedEmail.split('@')[0],
          atlas_role: 'athlete',
          onboarding_completed: false,
        },
      },
    });

    if (error) throw error;

    if (data.session?.user) {
      return {
        user: applyAuthenticatedUser(data.session.user),
        needsEmailConfirmation: false,
      };
    }

    return {
      user: normalizeSupabaseUser(data.user),
      needsEmailConfirmation: true,
    };
  }, [applyAuthenticatedUser]);

  const logout = useCallback(async () => {
    logoutInProgressRef.current = true;
    clearAuthState();
    hadAuthenticatedSessionRef.current = false;
    setAuthState(AUTH_STATES.UNAUTHENTICATED);
    setAuthError(null);

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
