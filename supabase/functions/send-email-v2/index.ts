/**
 * Send Email v2 - User-authenticated endpoint for sending emails
 * 
 * Authentication: Authorization: Bearer <JWT>
 * Use case: Logged-in users triggering emails manually
 * 
 * Rate limits enforced per user
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type EmailType = 'welcome' | 'confirm_email' | 'reset_password';
interface SendResult { success: boolean; id?: string; error?: string; }

async function sendEmail(opts: {
  type: EmailType; to: string; userId?: string; language?: string; payload: Record<string, unknown>;
}): Promise<SendResult> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('FROM_EMAIL') || 'Atlas Core <noreply@useatlascore.com>';
  const appUrl = Deno.env.get('APP_URL') || 'https://useatlascore.com';
  if (!resendApiKey) return { success: false, error: 'RESEND_API_KEY not set' };

  const { type, to, payload } = opts;
  const firstName = String(payload.firstName || to.split('@')[0]);
  let subject = '';
  let html = '';

  if (type === 'welcome') {
    subject = `Welcome to Atlas Core, ${firstName}!`;
    html = `<p>Hi ${firstName},</p><p>Welcome to <strong>Atlas Core</strong>! Your account is ready.</p><p><a href="${appUrl}">Open Atlas Core</a></p>`;
  } else if (type === 'confirm_email') {
    const confirmUrl = String(payload.confirmUrl || appUrl);
    subject = 'Confirm your Atlas Core email';
    html = `<p>Hi ${firstName},</p><p>Please confirm your email address:</p><p><a href="${confirmUrl}" style="display:inline-block;padding:10px 20px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Confirm email</a></p><p>Or copy: <a href="${confirmUrl}">${confirmUrl}</a></p>`;
  } else if (type === 'reset_password') {
    const resetUrl = String(payload.resetUrl || appUrl);
    subject = 'Reset your Atlas Core password';
    html = `<p>Hi ${firstName},</p><p>You requested a password reset:</p><p><a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Reset password</a></p><p>If you didn't request this, ignore this email.</p>`;
  } else {
    return { success: false, error: 'Unknown email type' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromEmail, to: [to.trim().toLowerCase()], subject, html }),
    });
    if (!res.ok) return { success: false, error: `Resend ${res.status}` };
    const data = await res.json();
    return { success: true, id: data.id };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// CORS headers
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Environment
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

// Rate limiting (in-memory, per-function-instance)
// For production, consider using Redis or Supabase rate limiting
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const MAX_EMAILS_PER_HOUR = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Allowed email types for authenticated users
const ALLOWED_TYPES: EmailType[] = [
  'welcome',
  'confirm_email',
  'reset_password',
];

// Request types
interface EmailRequest {
  type: EmailType;
  to: string;
  language?: string;
  payload: Record<string, unknown>;
}

// Validate user JWT and return user info
async function authenticateUser(req: Request): Promise<{ userId: string; email: string } | null> {
  const authHeader = req.headers.get('Authorization') || '';
  
  if (!authHeader.startsWith('Bearer ')) {
    console.log('Auth failed: no Bearer token');
    return null;
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  // Validate JWT with Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data.user) {
    console.log('Auth failed:', error?.message || 'no user');
    return null;
  }
  
  return {
    userId: data.user.id,
    email: data.user.email || '',
  };
}

// Check rate limit for user
function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const userLimit = rateLimits.get(userId);
  
  if (!userLimit || now > userLimit.resetAt) {
    // Reset window
    rateLimits.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: MAX_EMAILS_PER_HOUR - 1 };
  }
  
  if (userLimit.count >= MAX_EMAILS_PER_HOUR) {
    return { allowed: false, remaining: 0 };
  }
  
  userLimit.count++;
  return { allowed: true, remaining: MAX_EMAILS_PER_HOUR - userLimit.count };
}

// Validate request body
function validateRequest(body: unknown): { valid: boolean; error?: string; data?: EmailRequest } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }
  
  const req = body as EmailRequest;
  
  if (!req.type || !ALLOWED_TYPES.includes(req.type)) {
    return { valid: false, error: `Invalid or unsupported email type. Allowed: ${ALLOWED_TYPES.join(', ')}` };
  }
  
  if (!req.to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.to)) {
    return { valid: false, error: 'Valid recipient email required' };
  }
  
  if (!req.payload || typeof req.payload !== 'object') {
    return { valid: false, error: 'Payload required' };
  }
  
  return { valid: true, data: req };
}

// Main handler
serve(async (req) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }
  
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
  
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    component: 'SendEmailV2',
    event: 'request_start',
    requestId,
  }));
  
  // Authenticate user
  const user = await authenticateUser(req);
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
  
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    component: 'SendEmailV2',
    event: 'user_authenticated',
    requestId,
    userId: user.userId,
  }));
  
  // Check rate limit
  const rateCheck = checkRateLimit(user.userId);
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Max 10 emails per hour.' }),
      { 
        status: 429, 
        headers: { 
          ...CORS, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '0',
        } 
      }
    );
  }
  
  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
  
  // Validate request
  const validation = validateRequest(body);
  if (!validation.valid || !validation.data) {
    return new Response(
      JSON.stringify({ error: validation.error }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
  
  const emailReq = validation.data;
  
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    component: 'SendEmailV2',
    event: 'sending_email',
    requestId,
    userId: user.userId,
    type: emailReq.type,
    to: emailReq.to.substring(0, 3) + '...',
  }));
  
  // Send email
  const result = await sendEmail({
    type: emailReq.type,
    to: emailReq.to,
    userId: user.userId,
    language: emailReq.language || 'en',
    payload: emailReq.payload,
  });
  
  const duration = Date.now() - startTime;
  
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: result.success ? 'INFO' : 'ERROR',
    component: 'SendEmailV2',
    event: result.success ? 'email_sent' : 'email_failed',
    requestId,
    userId: user.userId,
    duration,
    success: result.success,
    resendId: result.id,
    error: result.error,
  }));
  
  // Return response
  const status = result.success ? 200 : 502;
  return new Response(
    JSON.stringify({
      success: result.success,
      requestId,
      duration,
      resendId: result.id,
      error: result.error,
      rateLimitRemaining: rateCheck.remaining,
    }),
    { 
      status, 
      headers: { 
        ...CORS, 
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': String(rateCheck.remaining),
      } 
    }
  );
});
