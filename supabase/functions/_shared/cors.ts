const DEFAULT_ALLOWED_ORIGIN = 'https://useatlascore.com';

const STATIC_ALLOWED_ORIGINS = new Set([
  DEFAULT_ALLOWED_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]);

function isAllowedVercelPreviewOrigin(origin: string): boolean {
  try {
    const parsed = new URL(origin);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

export function getAllowedOrigin(requestOrigin: string): string {
  if (STATIC_ALLOWED_ORIGINS.has(requestOrigin) || isAllowedVercelPreviewOrigin(requestOrigin)) {
    return requestOrigin;
  }

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
