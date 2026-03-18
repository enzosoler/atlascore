import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';
import { appParams } from '@/lib/app-params';

function getAccessToken() {
  if (typeof window === 'undefined') return appParams.token;

  return (
    window.localStorage.getItem('base44_access_token') ||
    window.localStorage.getItem('token') ||
    appParams.token
  );
}

export async function deleteCurrentAccount() {
  const client = createAxiosClient({
    baseURL: '/api',
    token: getAccessToken(),
    interceptResponses: true,
  });

  return client.delete(`/apps/${appParams.appId}/entities/User/me`);
}
