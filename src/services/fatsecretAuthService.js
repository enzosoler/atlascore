const TOKEN_URL = 'https://oauth.fatsecret.com/connect/token';
const CLIENT_ID = import.meta.env.VITE_FATSECRET_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_FATSECRET_CLIENT_SECRET;

let accessToken = null;
let tokenExpiry = 0;

export async function getAuthToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('FatSecret API Client ID or Client Secret not configured.');
  }

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'basic',
  });

  const authString = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${authString}`,
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`FatSecret Auth error: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute before expiry

  return accessToken;
}
