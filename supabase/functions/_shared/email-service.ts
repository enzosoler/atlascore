/**
 * Email Service - Core email sending logic
 * Handles Resend integration with retry logic and logging
 */

import { logEmailEvent } from './logger.ts';
import { buildTemplate, EmailType } from './templates.ts';
import { EmailError, ResendError, ConfigurationError } from './errors.ts';

export { EmailType };

export interface SendOptions {
  type: EmailType;
  to: string;
  userId?: string;
  language?: string;
  payload: Record<string, unknown>;
}

export interface SendResult {
  success: boolean;
  id?: string;
  error?: string;
}

// Configuration from environment
function getConfig() {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('FROM_EMAIL') || 'Atlas Core <noreply@useatlascore.com>';
  const appUrl = Deno.env.get('APP_URL') || 'https://atlascore.app';
  
  if (!resendApiKey) {
    throw new ConfigurationError('RESEND_API_KEY not configured');
  }
  
  return { resendApiKey, fromEmail, appUrl };
}

// Retry with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry if not retryable
      if (error instanceof EmailError && !error.retryable) {
        throw error;
      }
      
      // Don't retry after last attempt
      if (attempt === maxAttempts) {
        break;
      }
      
      // Exponential backoff: 2s, 4s
      const delayMs = Math.pow(2, attempt) * 1000;
      console.log(`Retry attempt ${attempt + 1}/${maxAttempts} after ${delayMs}ms`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}

// Send single email via Resend
async function sendViaResend(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<string> {
  const { resendApiKey, fromEmail } = getConfig();
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to.trim().toLowerCase()],
      subject,
      html,
      text,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new ResendError(
      `Resend API error: ${response.status} - ${errorText}`,
      response.status
    );
  }
  
  const data = await response.json();
  return data.id as string;
}

// Main send function with retry and logging
export async function sendEmail(options: SendOptions): Promise<SendResult> {
  const { type, to, userId, language = 'en', payload } = options;
  const startTime = Date.now();
  
  try {
    // Log attempt
    await logEmailEvent({
      userId,
      email: to,
      type,
      language,
      status: 'pending',
      attempt: 1,
    });
    
    // Build template
    const template = buildTemplate(type, payload as never);
    
    // Send with retry
    const resendId = await withRetry(async () => {
      return await sendViaResend(to, template.subject, template.html, template.text);
    }, 3);
    
    // Log success
    await logEmailEvent({
      userId,
      email: to,
      type,
      language,
      status: 'sent',
      resendId,
      metadata: {
        durationMs: Date.now() - startTime,
        subject: template.subject,
      },
    });
    
    return { success: true, id: resendId };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Log failure
    await logEmailEvent({
      userId,
      email: to,
      type,
      language,
      status: 'failed',
      errorMessage,
      metadata: {
        durationMs: Date.now() - startTime,
        errorType: error instanceof Error ? error.name : 'Unknown',
      },
    });
    
    console.error(`Email send failed [${type} -> ${to}]:`, errorMessage);
    
    return { success: false, error: errorMessage };
  }
}

// Convenience methods for common email types
export async function sendWelcome(
  to: string,
  firstName: string,
  userId?: string,
  language?: string
): Promise<SendResult> {
  const { appUrl } = getConfig();
  return sendEmail({
    type: 'welcome',
    to,
    userId,
    language,
    payload: { firstName, appUrl },
  });
}

export async function sendConfirmEmail(
  to: string,
  firstName: string,
  confirmUrl: string,
  userId?: string,
  language?: string
): Promise<SendResult> {
  const { appUrl } = getConfig();
  return sendEmail({
    type: 'confirm_email',
    to,
    userId,
    language,
    payload: { firstName, confirmUrl, appUrl },
  });
}

export async function sendTrialStarted(
  to: string,
  firstName: string,
  trialDaysLeft: number,
  userId?: string,
  language?: string
): Promise<SendResult> {
  const { appUrl } = getConfig();
  return sendEmail({
    type: 'trial_started',
    to,
    userId,
    language,
    payload: { firstName, trialDaysLeft, appUrl },
  });
}

export async function sendPasswordReset(
  to: string,
  firstName: string,
  resetUrl: string,
  userId?: string,
  language?: string
): Promise<SendResult> {
  const { appUrl } = getConfig();
  return sendEmail({
    type: 'reset_password',
    to,
    userId,
    language,
    payload: { firstName, resetUrl, appUrl },
  });
}
