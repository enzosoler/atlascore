/**
 * OAuth sign-in helpers backed by Supabase Auth.
 */

import { supabase } from '@/lib/supabaseClient';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { startNativeAuthSession } from '@/lib/nativeAuthSession';

function getDefaultRedirectUrl() {
  if (typeof window === 'undefined') return undefined;
  return `${window.location.origin}/auth/callback`;
}

async function completeNativeAuthSession(callbackUrl) {
  if (!callbackUrl) {
    throw new Error('Missing native auth callback URL.');
  }

  const urlObj = new URL(callbackUrl.replace('atlascore://', 'https://atlascore.local/'));
  const code = urlObj.searchParams.get('code');
  const hashParams = new URLSearchParams(urlObj.hash.substring(1));
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return data;
  }

  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    return data;
  }

  throw new Error('Native auth callback did not contain a valid session payload.');
}

/**
 * Start OAuth sign-in.
 * On native iOS/Android: opens an in-app browser and redirects back via atlascore:// deep link.
 * On web: standard redirect flow.
 */
export const signInWithOAuth = async (
  provider,
  redirectUrl = getDefaultRedirectUrl()
) => {
  try {
    if (!provider) {
      throw new Error('OAuth provider is required.');
    }

    const isNative = Capacitor.isNativePlatform();

    if (isNative && Capacitor.getPlatform() === 'ios') {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'atlascore://auth/callback',
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (!data?.url) throw new Error(`Missing ${provider} OAuth redirect URL.`);

      const callbackUrl = await startNativeAuthSession(data.url, {
        callbackScheme: 'atlascore',
        prefersEphemeralWebBrowserSession: false,
      });

      const sessionData = await completeNativeAuthSession(callbackUrl);
      return {
        ...data,
        session: sessionData?.session ?? null,
        user: sessionData?.user ?? null,
      };
    }

    if (isNative) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'atlascore://auth/callback',
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (!data?.url) throw new Error(`Missing ${provider} OAuth redirect URL.`);
      await Browser.open({ url: data.url, windowName: '_self' });
      return data;
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        ...(provider === 'google'
          ? {
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              },
            }
          : {}),
      },
    });

    if (error) {
      console.error('[auth] OAuth start failed:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[auth] OAuth flow failed:', error);
    throw error;
  }
};

export const signInWithGoogle = async (redirectUrl = getDefaultRedirectUrl()) =>
  signInWithOAuth('google', redirectUrl);

/**
 * Sign out
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Sign out failed:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Get current user failed:', error);
    return null;
  }
};
