/**
 * Google Sign-In Service
 * Handles OAuth authentication via Supabase
 */

import { supabase } from '@/lib/supabaseClient';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

/**
 * Start OAuth sign-in.
 * On native iOS/Android: opens an in-app browser and redirects back via atlascore:// deep link
 * On web: standard redirect flow
 */
export const signInWithOAuth = async (
  provider,
  redirectUrl = `${window.location.origin}/auth/callback`
) => {
  try {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'atlascore://auth/callback',
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
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
      console.error('Google Sign-In Error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
};

export const signInWithGoogle = async (redirectUrl = `${window.location.origin}/auth/callback`) =>
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
