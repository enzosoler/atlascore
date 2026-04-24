import { emailTokens } from './email-tokens.js';
import { emailComponents } from './email-components.js';
import {
  canonicalTemplateOrder,
  canonicalTemplates,
  legacyTemplateAliases,
  legacyTemplates,
  previewVariables,
  templates,
} from './email-templates.js';
import { renderBrandedEmail, renderEmail } from './email-renderer.js';

type Locale = 'pt-BR' | 'en';

export interface RenderedEmail {
  subject: string;
  preheader: string;
  html: string;
  text: string;
}

export interface BrandedEmailInput {
  locale?: Locale;
  kind?: 'founder' | 'system';
  subject: string;
  preheader: string;
  eyebrow?: string;
  headline: string;
  body: string[];
  cta?: { label: string; url: string } | null;
  ctaLabel?: string;
  ctaUrl?: string;
  dataBlock?: { title?: string; rows: { label: string; value: string }[] } | null;
  signature?: { signoff?: string; name: string; role?: string } | null;
  hero?: string;
  note?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
}

export {
  canonicalTemplateOrder,
  canonicalTemplates,
  emailComponents,
  emailTokens,
  legacyTemplateAliases,
  legacyTemplates,
  previewVariables,
  renderBrandedEmail,
  renderEmail,
  templates,
};

export type EmailType =
  | 'welcome'
  | 'onboarding_check_in'
  | 'confirm_identity'
  | 'reset_password'
  | 'email_confirmation'
  | 'magic_login'
  | 'security_alert'
  | 'trial_ending'
  | 'trial_ended'
  | 'subscription_activated'
  | 'payment_failed'
  | 'billing_receipt'
  | 'confirm_email'
  | 'trial_started'
  | 'trial_expired'
  | 'payment_success'
  | 'subscription_canceled'
  | 'inactivity_nudge'
  | 'weekly_report'
  | 'invite_beta'
  | 'founder_welcome'
  | 'founder_check_in';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function buildTemplate(
  type: EmailType,
  data: Record<string, unknown>,
): EmailTemplate {
  const locale: Locale = (data['language'] as Locale) ?? (emailTokens.brand.defaultLocale as Locale);
  const variables: Record<string, string> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) variables[key] = String(value);
  }

  const remap: Record<string, Record<string, string>> = {
    welcome: { appUrl: 'app_url' },
    onboarding_check_in: { replyEmail: 'reply_email' },
    confirm_identity: { confirmUrl: 'confirm_identity_url', otpCode: 'otp_code' },
    email_confirmation: { confirmUrl: 'confirm_email_url' },
    confirm_email: { confirmUrl: 'confirm_email_url' },
    magic_login: { magicUrl: 'magic_login_url' },
    reset_password: { resetUrl: 'reset_password_url' },
    security_alert: {
      securityUrl: 'security_action_url',
      action: 'alert_action',
      time: 'alert_time',
      location: 'alert_location',
    },
    trial_started: { appUrl: 'app_url', trialDaysLeft: 'trial_end_date' },
    trial_ending: { trialEndsAt: 'trial_end_date', billingUrl: 'billing_url', planName: 'plan_name' },
    trial_ended: { billingUrl: 'billing_url' },
    trial_expired: { billingUrl: 'billing_url' },
    subscription_activated: { appUrl: 'app_url', planName: 'plan_name', renewalDate: 'renewal_date' },
    payment_failed: { billingUrl: 'billing_url', planName: 'plan_name', retryDate: 'retry_date' },
    payment_success: { receiptId: 'receipt_id', receiptUrl: 'receipt_url', amount: 'amount' },
    billing_receipt: { receiptId: 'receipt_id', receiptUrl: 'receipt_url', amount: 'amount', receiptDate: 'receipt_date' },
    subscription_canceled: { billingUrl: 'billing_url', accessEndDate: 'access_end_date' },
    weekly_report: {
      weeklyReportUrl: 'weekly_report_url',
      reportDateRange: 'report_date_range',
      weekWorkouts: 'week_workouts',
    },
    invite_beta: { inviteUrl: 'invite_url', inviteExpiryDate: 'invite_expiry_date', firstName: 'first_name' },
    founder_welcome: { appUrl: 'app_url' },
    founder_check_in: { replyEmail: 'reply_email' },
  };

  for (const [from, to] of Object.entries(remap[type] ?? {})) {
    if (variables[from] !== undefined && variables[to] === undefined) {
      variables[to] = variables[from];
    }
  }

  if (!variables.app_url) variables.app_url = emailTokens.brand.siteUrl;
  if (!variables.billing_url) variables.billing_url = `${emailTokens.brand.siteUrl}/billing`;
  if (!variables.reply_email) variables.reply_email = emailTokens.brand.founderReplyEmail;
  if (!variables.receipt_url) variables.receipt_url = `${emailTokens.brand.siteUrl}/billing`;

  const rendered = renderEmail(type, locale, variables);
  return { subject: rendered.subject, html: rendered.html, text: rendered.text };
}

