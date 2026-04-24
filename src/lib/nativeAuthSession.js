import { Capacitor, registerPlugin } from '@capacitor/core';

const IS_IOS = Capacitor.getPlatform() === 'ios';
const NativeAuthSessionPlugin = IS_IOS ? registerPlugin('NativeAuthSession') : null;

export async function startNativeAuthSession(url, options = {}) {
  if (!IS_IOS || !NativeAuthSessionPlugin) {
    throw new Error('Native auth session is only available on iOS.');
  }

  if (!url) {
    throw new Error('A native auth URL is required.');
  }

  const result = await NativeAuthSessionPlugin.start({
    url,
    callbackScheme: options.callbackScheme ?? 'atlascore',
    prefersEphemeralWebBrowserSession: options.prefersEphemeralWebBrowserSession ?? false,
  });

  return result?.callbackUrl;
}
