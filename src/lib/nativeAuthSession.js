import { Capacitor, registerPlugin } from '@capacitor/core';

const IS_IOS = Capacitor.getPlatform() === 'ios';
let NativeAuthSessionPlugin = null;

try {
  NativeAuthSessionPlugin = IS_IOS ? registerPlugin('NativeAuthSession') : null;
} catch (e) {
  console.warn('[NativeAuthSession] Plugin registration failed:', e?.message || e);
}

export async function startNativeAuthSession(url, options = {}) {
  if (!IS_IOS) {
    throw new Error('Native auth session is only available on iOS.');
  }

  if (!NativeAuthSessionPlugin) {
    throw new Error(
      'NativeAuthSession plugin is not available. ' +
      'Ensure the native iOS build includes AtlasBridgeViewController and NativeAuthSession.swift.'
    );
  }

  if (!url) {
    throw new Error('A native auth URL is required.');
  }

  try {
    const result = await NativeAuthSessionPlugin.start({
      url,
      callbackScheme: options.callbackScheme ?? 'atlascore',
      prefersEphemeralWebBrowserSession: options.prefersEphemeralWebBrowserSession ?? false,
    });
    return result?.callbackUrl;
  } catch (error) {
    console.error('[NativeAuthSession] start() failed:', {
      message: error?.message || null,
      code: error?.code || null,
    });
    throw error;
  }
}
