/**
 * Structured logger for email events
 * Logs to console AND persists to email_events table
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface LogEntry {
  userId?: string;
  email: string;
  type: string;
  language: string;
  status: 'pending' | 'sent' | 'failed' | 'retrying';
  resendId?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  attempt?: number;
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

export async function logEmailEvent(entry: LogEntry): Promise<void> {
  const timestamp = new Date().toISOString();
  
  // Console log (structured)
  const logLine = {
    timestamp,
    level: entry.status === 'failed' ? 'ERROR' : entry.status === 'retrying' ? 'WARN' : 'INFO',
    component: 'EmailService',
    ...entry,
  };
  console.log(JSON.stringify(logLine));

  // Persist to database (fire-and-forget, don't block)
  if (SUPABASE_URL && SERVICE_ROLE_KEY) {
    try {
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
      await admin.from('email_events').insert({
        user_id: entry.userId || null,
        email: entry.email,
        type: entry.type,
        language: entry.language,
        status: entry.status,
        resend_id: entry.resendId || null,
        error_message: entry.errorMessage || null,
        metadata: entry.metadata || null,
      });
    } catch (err) {
      // Don't throw - logging failure shouldn't break email flow
      console.error('Failed to persist email log:', err);
    }
  }
}

export function logWebhook(event: string, data: Record<string, unknown>): void {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    component: 'AuthWebhook',
    event,
    ...data,
  }));
}
