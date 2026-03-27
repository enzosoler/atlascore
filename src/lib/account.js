import { appParams } from '@/lib/app-params';

function getAccessToken() {
  if (typeof window === 'undefined') return appParams.token;

  return (
    window.localStorage.getItem('token') ||
    appParams.token
  );
}

export async function deleteCurrentAccount() {
  const token = getAccessToken();
  const response = await fetch(`/api/apps/${appParams.appId}/entities/User/me`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete account: ${response.status}`);
  }

  return response.json().catch(() => null);
}
