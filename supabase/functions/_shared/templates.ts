/**
 * Email templates for atlas.core
 * Structured schema with variable interpolation and a single HTML renderer.
 */

type EmailTemplateSchema = {
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
    border: 'rgba(255,255,255,0.10)',
    textPrimary: 'rgba(255,255,255,0.92)',
    textSecondary: 'rgba(255,255,255,0.64)',
  },
};

export const templates: Record<string, EmailTemplateSchema> = {
  welcome: {
    subject: 'atlas.core — welcome',
    preheader: 'Your workspace is ready.',
    headline: 'Welcome to atlas.core',
    body: [
      'Your workspace is ready.',
      'Start logging. Start reviewing. Start improving.',
      'You are active. Let us build.',
    ],
    ctaLabel: 'Open workspace',
    ctaUrl: `${brand.siteUrl}/app`,
    note: 'You are receiving this email because an account was created for atlas.core.',
  },

  confirm_email: {
    subject: 'atlas.core — confirm your account',
    preheader: 'Confirm your email to activate your workspace.',
    headline: 'Confirm your email',
    body: [
      'Your account is ready.',
      'Confirm your email address to activate your workspace.',
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
      'This session expires soon.',
    ],
    ctaLabel: 'Reset password',
    ctaUrl: '{{reset_password_url}}',
    note: 'If you did not request a password reset, ignore this email.',
  },

  trial_started: {
    subject: 'atlas.core — trial started',
    preheader: 'You now have full access.',
    headline: 'Your trial is active',
    body: [
      'You now have full access to atlas.core.',
      'Use the trial window with intent.',
    ],
    ctaLabel: 'Open workspace',
    ctaUrl: `${brand.siteUrl}/app`,
    note: 'Your trial period ends on {{trial_end_date}}.',
  },

  trial_ending: {
    subject: 'atlas.core — 2 days remaining',
    preheader: 'Your trial ends in 2 days.',
    headline: '2 days remaining',
    body: [
      'Your trial ends in 2 days.',
      'Upgrade to keep access to your workspace, history, and active protocols.',
    ],
    ctaLabel: 'View plans',
    ctaUrl: `${brand.siteUrl}/billing`,
    secondaryCtaLabel: 'Open workspace',
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
    note: 'Your data remains available after upgrade.',
  },

  payment_success: {
    subject: 'atlas.core — payment confirmed',
    preheader: 'Your subscription remains active.',
    headline: 'Payment confirmed',
    body: [
      'Your payment was processed successfully.',
      'Your subscription remains active.',
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
      'Update your billing details to avoid interruption.',
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
    ],
    ctaLabel: 'Open workspace',
    ctaUrl: `${brand.siteUrl}/app`,
    secondaryCtaLabel: 'Reactivate',
    secondaryCtaUrl: `${brand.siteUrl}/billing`,
    note: 'Your data remains intact during the active billing period.',
  },

  inactivity_nudge: {
    subject: 'atlas.core — return to your workspace',
    preheader: 'Your workspace is idle.',
    headline: 'Your workspace is idle',
    body: [
      'You have not logged in recently.',
      'Return to the work. Continue where you left off.',
    ],
    ctaLabel: 'Open workspace',
    ctaUrl: `${brand.siteUrl}/app`,
    note: 'You are not here to log data for the sake of it.',
  },

  weekly_report: {
    subject: 'atlas.core — your week, {{report_date_range}}',
    preheader: 'Review the week. Identify the gap. Adjust.',
    headline: 'Your week',
    body: [
      'Review the week. Identify the gap. Adjust.',
      'Metrics matter only if they change the next decision.',
    ],
    ctaLabel: 'View report',
    ctaUrl: '{{weekly_report_url}}',
    note: 'Week: {{report_date_range}}',
  },

  milestone_streak_7: {
    subject: 'atlas.core — 7-day streak',
    preheader: 'Seven days. Kept, not claimed.',
    headline: '7-day streak',
    body: [
      'Seven days. Kept, not claimed.',
      'Most people stop early. You did not.',
      'Maintain the standard.',
    ],
    ctaLabel: 'Open workspace',
    ctaUrl: `${brand.siteUrl}/app`,
    note: 'Streak count: 7 days.',
  },

  invite_beta: {
    subject: 'atlas.core — early access invitation',
    preheader: 'You have been invited to atlas.core.',
    headline: 'Early access',
    body: [
      'You have been invited to atlas.core.',
      'This is early access. Expect precision. Expect iteration.',
    ],
    ctaLabel: 'Accept invitation',
    ctaUrl: '{{invite_url}}',
    note: 'Invitation expires on {{invite_expiry_date}}.',
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

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function renderEmail(
  templateKey: string,
  variables: Record<string, string> = {},
): EmailTemplate {
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
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:${brand.colors.obsidian};font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;visibility:hidden;">${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${brand.colors.obsidian};padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:${brand.colors.obsidian};border:1px solid ${brand.colors.border};">

            <!-- Wordmark -->
            <tr>
              <td style="padding:28px 28px 16px 28px;">
                <span style="font-size:18px;line-height:1;font-weight:700;letter-spacing:-0.03em;color:${brand.colors.white};">${escapeHtml(brand.name)}</span>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:0 28px;">
                <div style="height:1px;background:${brand.colors.border};"></div>
              </td>
            </tr>

            <!-- Headline -->
            <tr>
              <td style="padding:28px 28px 0 28px;">
                <h1 style="margin:0;color:${brand.colors.white};font-size:30px;line-height:1.1;font-weight:700;letter-spacing:-0.02em;">${escapeHtml(headline)}</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:16px 28px 0 28px;">
                ${body
                  .map(
                    (paragraph) =>
                      `<p style="margin:0 0 10px 0;color:${brand.colors.textPrimary};font-size:16px;line-height:1.6;">${escapeHtml(paragraph)}</p>`,
                  )
                  .join('\n                ')}
              </td>
            </tr>

            ${template.ctaLabel && ctaUrl ? `
            <!-- Primary CTA -->
            <tr>
              <td style="padding:24px 28px 0 28px;">
                <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:${brand.colors.cyan};color:${brand.colors.obsidian};text-decoration:none;font-size:15px;line-height:1;font-weight:700;padding:14px 20px;border-radius:6px;">${escapeHtml(template.ctaLabel)}</a>
              </td>
            </tr>` : ''}

            ${template.secondaryCtaLabel && secondaryCtaUrl ? `
            <!-- Secondary CTA -->
            <tr>
              <td style="padding:14px 28px 0 28px;">
                <a href="${escapeHtml(secondaryCtaUrl)}" style="color:${brand.colors.textSecondary};font-size:14px;text-decoration:underline;text-underline-offset:3px;">${escapeHtml(template.secondaryCtaLabel)}</a>
              </td>
            </tr>` : ''}

            ${note ? `
            <!-- Note -->
            <tr>
              <td style="padding:24px 28px 0 28px;">
                <div style="border-top:1px solid ${brand.colors.border};padding-top:20px;">
                  <p style="margin:0;color:${brand.colors.textSecondary};font-size:13px;line-height:1.5;">${escapeHtml(note)}</p>
                </div>
              </td>
            </tr>` : ''}

            <!-- Footer -->
            <tr>
              <td style="padding:24px 28px 28px 28px;">
                <p style="margin:0;color:${brand.colors.textSecondary};font-size:12px;line-height:1.5;">${escapeHtml(brand.name)} &middot; <a href="${brand.siteUrl}" style="color:${brand.colors.textSecondary};text-decoration:none;">${brand.siteUrl.replace('https://', '')}</a> &middot; <a href="mailto:${brand.supportEmail}" style="color:${brand.colors.textSecondary};text-decoration:none;">${brand.supportEmail}</a></p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    brand.name.toUpperCase(),
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

  return { subject, html, text };
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

export function buildTemplate(
  type: EmailType,
  data: Record<string, unknown>,
): EmailTemplate {
  const variables: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined && v !== null) variables[k] = String(v);
  }

  // Map legacy payload keys → template variable names
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
