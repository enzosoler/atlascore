const DEFAULT_ALLOWED_ORIGIN = 'https://useatlascore.com';

const STATIC_ALLOWED_ORIGINS = new Set([
  DEFAULT_ALLOWED_ORIGIN,
  'https://admin.useatlascore.com',
  // Capacitor native app origins (iOS)
  'capacitor://localhost',
  'atlascore://localhost',
  // Local dev
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]);

/** Extra origins from APP_URLS env var (comma-separated). */
function getEnvOrigins(): string[] {
  const raw = Deno.env.get('APP_URLS') || '';
  return raw.split(',').map((u) => u.trim()).filter(Boolean);
}

function isAllowedVercelPreviewOrigin(origin: string): boolean {
  try {
    const parsed = new URL(origin);
    // Scope to atlas project slugs only — bare *.vercel.app is too broad
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname.endsWith('.vercel.app') &&
      parsed.hostname.startsWith('atlas')
    );
  } catch {
    return false;
  }
}

export function getAllowedOrigin(requestOrigin: string): string {
  if (STATIC_ALLOWED_ORIGINS.has(requestOrigin)) return requestOrigin;
  if (getEnvOrigins().includes(requestOrigin)) return requestOrigin;
  if (isAllowedVercelPreviewOrigin(requestOrigin)) return requestOrigin;

  if (requestOrigin) {
    console.warn('[cors] blocked origin:', requestOrigin);
  }

  return DEFAULT_ALLOWED_ORIGIN;
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';

  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(origin),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

export function buildPreflightResponse(req: Request): Response {
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(req),
  });
}
