/**
 * Email templates for atlas.core
 * Structured schema with variable interpolation and a single HTML renderer.
 */

type EmailTemplate = {
  subject: string;
  preheader: string;
  headline: string;
  body: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  note?: string;
};

const brand = {
  name: 'atlas.core',
  siteUrl: 'https://www.useatlascore.com',
  supportEmail: 'support@useatlascore.com',
  colors: {
    cyan: '#00FFFF',
    obsidian: '#05070A',
    white: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    border: 'rgba(255,255,255,0.10)',
    textPrimary: 'rgba(255,255,255,0.92)',
    textSecondary: 'rgba(255,255,255,0.64)',
  },
};

export const templates: Record<string, EmailTemplate> = {
  welcome: {
    subject: 'atlas.core — welcome',
    preheader: 'Your workspace is ready.',
    headline: 'Welcome to atlas.core',
    body: [
      'Your workspace is ready.',
      'Tracking, workouts, nutrition, labs, body composition, and protocols are live.',
      'Start clean. Build the standard early.',
    ],
    ctaLabel: 'Enter atlas.core',
    ctaUrl: `${brand.siteUrl}/app`,
    note: 'You are receiving this email because an atlas.core account was created for this address.',
  },

  confirm_email: {
    subject: 'atlas.core — confirm your account',
    preheader: 'Confirm your email to activate your workspace.',
    headline: 'Confirm your email',
    body: [
      'Your account is ready.',
      'Confirm your email to activate your workspace and continue setup.',
    ],
    ctaLabel: 'Confirm email',
    ctaUrl: '{{confirm_email_url}}',
    note: 'If you did not create this account, ignore this email.',
  },

  reset_password: {
    subject: 'atlas.core — reset your password',
    preheader: 'Use this link to set a new password.',
    headline: 'Reset your password',
    body: [
      'Use the link below to set a new password.',
      'Do it now. This link expires soon.',
    ],
    ctaLabel: 'Reset password',
    ctaUrl: '{{reset_password_url}}',
    note: 'If you did not request this reset, ignore this email.',
  },

  trial_started: {
    subject: 'atlas.core — trial started',
    preheader: 'You now have full access.',
    headline: 'Your trial is active',
    body: [
      'You now have full access to atlas.core.',
      'Use the trial window properly. Everything is unlocked.',
    ],
    ctaLabel: 'Enter atlas.core',
    ctaUrl: `${brand.siteUrl}/app`,
    note: 'Your trial ends on {{trial_end_date}}.',
  },

  trial_ending: {
    subject: 'atlas.core — 2 days remaining',
    preheader: 'Your trial ends in 2 days.',
    headline: '2 days remaining',
    body: [
      'Your trial ends in 2 days.',
      'Upgrade to keep access to your workspace, history, protocols, and reporting.',
      'Do not lose momentum over admin.',
    ],
    ctaLabel: 'View plans',
    ctaUrl: `${brand.siteUrl}/billing`,
    secondaryCtaLabel: 'Enter atlas.core',
    secondaryCtaUrl: `${brand.siteUrl}/app`,
    note: 'No action is required if you do not plan to continue.',
  },

  trial_expired: {
    subject: 'atlas.core — trial ended',
    preheader: 'Your workspace is paused until you upgrade.',
    headline: 'Trial ended',
    body: [
      'Your workspace is paused.',
      'Your data remains intact.',
      'Upgrade to restore access and continue where you left off.',
    ],
    ctaLabel: 'Upgrade now',
    ctaUrl: `${brand.siteUrl}/billing`,
    note: 'Your data is preserved and will be available again after upgrade.',
  },

  payment_success: {
    subject: 'atlas.core — payment confirmed',
    preheader: 'Your subscription remains active.',
    headline: 'Payment confirmed',
    body: [
      'Your payment was processed successfully.',
      'Access remains active. Nothing else is required.',
    ],
    ctaLabel: 'Open billing',
    ctaUrl: `${brand.siteUrl}/billing`,
    note: 'Receipt ID: {{receipt_id}}',
  },

  payment_failed: {
    subject: 'atlas.core — payment failed',
    preheader: 'Update billing details to avoid interruption.',
    headline: 'Payment failed',
    body: [
      'We could not process your payment.',
      'Update your billing details now to avoid interruption.',
    ],
    ctaLabel: 'Update payment',
    ctaUrl: `${brand.siteUrl}/billing`,
    note: 'We will retry payment on {{retry_date}}.',
  },

  subscription_canceled: {
    subject: 'atlas.core — subscription canceled',
    preheader: 'Your subscription has been canceled.',
    headline: 'Subscription canceled',
    body: [
      'Your subscription has been canceled.',
      'Access remains available until {{access_end_date}}.',
      'After that, the workspace is paused until you reactivate.',
    ],
    ctaLabel: 'Reactivate subscription',
    ctaUrl: `${brand.siteUrl}/billing`,
    secondaryCtaLabel: 'Enter atlas.core',
    secondaryCtaUrl: `${brand.siteUrl}/app`,
    note: 'Your data remains intact during the current billing period.',
  },

  inactivity_nudge: {
    subject: 'atlas.core — return to your workspace',
    preheader: 'Your workspace is idle.',
    headline: 'Your workspace is idle',
    body: [
      'You have not logged in recently.',
      'Return to the work. Continue where you left off.',
      'You are not here to log data for the sake of it.',
    ],
    ctaLabel: 'Enter atlas.core',
    ctaUrl: `${brand.siteUrl}/app`,
    note: 'Your workspace is still available.',
  },

  weekly_report: {
    subject: 'atlas.core — your week, {{report_date_range}}',
    preheader: 'Review the week. Identify the gap. Adjust.',
    headline: 'Your week',
    body: [
      'Review the week. Identify the gap. Adjust.',
      'Metrics matter only if they change the next decision.',
      'Open the report and act on it.',
    ],
    ctaLabel: 'View report',
    ctaUrl: '{{weekly_report_url}}',
    note: 'Week: {{report_date_range}}',
  },

  milestone_streak_7: {
    subject: 'atlas.core — 7-day streak',
    preheader: 'Seven days. Earned, not claimed.',
    headline: '7-day streak',
    body: [
      'Seven days. Earned, not claimed.',
      'Most people stop early. You did not.',
      'Keep the standard where it belongs.',
    ],
    ctaLabel: 'Enter atlas.core',
    ctaUrl: `${brand.siteUrl}/app`,
    note: 'Streak count: 7 days.',
  },

  invite_beta: {
    subject: 'atlas.core — early access',
    preheader: 'You have been invited to atlas.core.',
    headline: 'Early access',
    body: [
      'Early access, {{first_name}}.',
      'I am building atlas.core — a training and health system for athletes and the professionals who manage them.',
      'You are part of a small group with direct access before launch.',
      'Your access includes everything: athlete tracking, workouts, nutrition, labs, body composition, coach workflows, clinician workflows, and protocols.',
      'No restrictions.',
      'Use it properly. Break it if needed.',
      'I want direct feedback: what works, what slows you down, and what should not exist.',
    ],
    ctaLabel: 'Enter atlas.core',
    ctaUrl: '{{invite_url}}',
    note: 'You are receiving this email because you were invited directly to early access. Invitation expires on {{invite_expiry_date}}.',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const interpolate = (input: string, variables: Record<string, string>) =>
  input.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => variables[key] ?? `{{${key}}}`);

// ─── Renderer ─────────────────────────────────────────────────────────────────

export interface RenderedEmail {
  subject: string;
  preheader: string;
  html: string;
  text: string;
}

export function renderEmail(
  templateKey: string,
  variables: Record<string, string> = {},
): RenderedEmail {
  const template = templates[templateKey];
  if (!template) {
    throw new Error(`Unknown template: ${templateKey}`);
  }

  const subject = interpolate(template.subject, variables);
  const preheader = interpolate(template.preheader, variables);
  const headline = interpolate(template.headline, variables);
  const body = template.body.map((line) => interpolate(line, variables));
  const note = template.note ? interpolate(template.note, variables) : '';
  const ctaUrl = template.ctaUrl ? interpolate(template.ctaUrl, variables) : '';
  const secondaryCtaUrl = template.secondaryCtaUrl
    ? interpolate(template.secondaryCtaUrl, variables)
    : '';

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="dark only" />
    <meta name="supported-color-schemes" content="dark only" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:${brand.colors.obsidian};font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;visibility:hidden;">
      ${escapeHtml(preheader)}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${brand.colors.obsidian};margin:0;padding:24px 0;">
      <tr>
        <td align="center" style="padding:0 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:${brand.colors.obsidian};border:1px solid ${brand.colors.border};">
            <tr>
              <td style="padding:28px 28px 12px 28px;">
                <div style="font-size:20px;line-height:1;font-weight:700;letter-spacing:-0.03em;color:${brand.colors.white};">
                  atlas.core
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 28px 0 28px;">
                <h1 style="margin:0;color:${brand.colors.white};font-size:32px;line-height:1.08;font-weight:700;letter-spacing:-0.02em;">
                  ${escapeHtml(headline)}
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 28px 0 28px;">
                ${body
                  .map(
                    (paragraph) =>
                      `<p style="margin:0 0 12px 0;color:${brand.colors.textPrimary};font-size:16px;line-height:1.55;">${escapeHtml(paragraph)}</p>`,
                  )
                  .join('\n                ')}
              </td>
            </tr>

            ${template.ctaLabel && ctaUrl ? `
            <tr>
              <td style="padding:20px 28px 0 28px;">
                <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:${brand.colors.cyan};color:${brand.colors.obsidian};text-decoration:none;font-size:15px;line-height:15px;font-weight:700;padding:14px 18px;border-radius:6px;">${escapeHtml(template.ctaLabel)}</a>
              </td>
            </tr>` : ''}

            ${template.secondaryCtaLabel && secondaryCtaUrl ? `
            <tr>
              <td style="padding:12px 28px 0 28px;">
                <a href="${escapeHtml(secondaryCtaUrl)}" style="display:inline-block;color:${brand.colors.cyan};text-decoration:none;font-size:14px;line-height:20px;font-weight:600;">${escapeHtml(template.secondaryCtaLabel)}</a>
              </td>
            </tr>` : ''}

            <tr>
              <td style="padding:28px 28px 0 28px;">
                <div style="height:1px;background:${brand.colors.border};font-size:1px;line-height:1px;">&nbsp;</div>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 28px 28px 28px;">
                ${note ? `<p style="margin:0 0 10px 0;color:${brand.colors.textSecondary};font-size:13px;line-height:1.55;">${escapeHtml(note)}</p>` : ''}
                <p style="margin:0 0 10px 0;color:${brand.colors.textSecondary};font-size:13px;line-height:1.55;word-break:break-word;">
                  If the button does not work, use this link:<br />
                  <span style="color:${brand.colors.white};">${escapeHtml(ctaUrl || brand.siteUrl)}</span>
                </p>
                <p style="margin:0;color:${brand.colors.textSecondary};font-size:12px;line-height:1.55;">
                  ${brand.name} &middot; <a href="mailto:${brand.supportEmail}" style="color:${brand.colors.textSecondary};text-decoration:none;">${brand.supportEmail}</a> &middot; <a href="${brand.siteUrl}" style="color:${brand.colors.textSecondary};text-decoration:none;">useatlascore.com</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    'atlas.core'.toUpperCase(),
    '',
    headline.toUpperCase(),
    '',
    ...body,
    '',
    ...(template.ctaLabel && ctaUrl ? [`${template.ctaLabel}: ${ctaUrl}`, ''] : []),
    ...(template.secondaryCtaLabel && secondaryCtaUrl
      ? [`${template.secondaryCtaLabel}: ${secondaryCtaUrl}`, '']
      : []),
    ...(note ? ['---', note, ''] : []),
    `${brand.name} · ${brand.siteUrl}`,
  ].join('\n');

  return { subject, preheader, html, text };
}

export function renderAllExamples() {
  return {
    welcome: renderEmail('welcome'),
    confirm_email: renderEmail('confirm_email', { confirm_email_url: `${brand.siteUrl}/confirm?token=demo` }),
    reset_password: renderEmail('reset_password', { reset_password_url: `${brand.siteUrl}/reset-password?token=demo` }),
    trial_started: renderEmail('trial_started', { trial_end_date: 'April 3, 2026' }),
    trial_ending: renderEmail('trial_ending'),
    trial_expired: renderEmail('trial_expired'),
    payment_success: renderEmail('payment_success', { receipt_id: 'rcpt_001' }),
    payment_failed: renderEmail('payment_failed', { retry_date: 'March 29, 2026' }),
    subscription_canceled: renderEmail('subscription_canceled', { access_end_date: 'April 27, 2026' }),
    inactivity_nudge: renderEmail('inactivity_nudge'),
    weekly_report: renderEmail('weekly_report', {
      report_date_range: 'Mar 17–23',
      weekly_report_url: `${brand.siteUrl}/reports/weekly`,
    }),
    milestone_streak_7: renderEmail('milestone_streak_7'),
    invite_beta: renderEmail('invite_beta', {
      first_name: 'Enzo',
      invite_url: `${brand.siteUrl}/invite?token=demo`,
      invite_expiry_date: 'April 1, 2026',
    }),
  };
}

// ─── Legacy compat for email-service.ts ───────────────────────────────────────

export type EmailType =
  | 'welcome'
  | 'confirm_email'
  | 'trial_started'
  | 'reset_password'
  | 'invite_beta'
  | 'payment_success'
  | 'payment_failed'
  | 'subscription_canceled';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function buildTemplate(
  type: EmailType,
  data: Record<string, unknown>,
): EmailTemplate {
  const variables: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined && v !== null) variables[k] = String(v);
  }

  const remap: Record<string, Record<string, string>> = {
    confirm_email: { confirmUrl: 'confirm_email_url' },
    reset_password: { resetUrl: 'reset_password_url' },
    trial_started: { trialDaysLeft: 'trial_end_date' },
    invite_beta: { inviteUrl: 'invite_url' },
    payment_failed: { billingUrl: 'billing_url' },
    subscription_canceled: { periodEnd: 'access_end_date' },
  };

  for (const [from, to] of Object.entries(remap[type] ?? {})) {
    if (variables[from] !== undefined) variables[to] = variables[from];
  }

  return renderEmail(type, variables);
}
