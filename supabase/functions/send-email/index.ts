/**
 * send-email - Atlas Core unified email dispatcher
 *
 * English-only transactional email renderer.
 * Older callers may still send legacy locale values, but output is always normalized to English.
 *
 * Deploy:
 *   supabase functions deploy send-email
 *
 * Secrets required:
 *   supabase secrets set RESEND_API_KEY=re_xxxx
 *   supabase secrets set FROM_EMAIL="Atlas Core <noreply@useatlascore.com>"
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type RequestedLang = string;
type RenderLang = 'en';

type EmailType =
  | 'welcome'
  | 'confirm_email'
  | 'reset_password'
  | 'trial_started'
  | 'trial_ending'
  | 'trial_expired'
  | 'payment_success'
  | 'payment_failed'
  | 'inactivity_nudge'
  | 'weekly_report'
  | 'milestone';

interface EmailPayload {
  firstName?: string;
  confirmUrl?: string;
  resetUrl?: string;
  appUrl?: string;
  trialDaysLeft?: number;
  trialEndsAt?: string;
  planName?: string;
  amount?: string;
  currency?: string;
  invoiceUrl?: string;
  lastActivityDays?: number;
  weekWorkouts?: number;
  weekNutritionDays?: number;
  weightChange?: number;
  currentStreak?: number;
  milestoneKey?: 'first_workout' | 'workouts_5' | 'workouts_10' | 'streak_7' | 'streak_14' | 'streak_30';
  [key: string]: unknown;
}

interface EmailRequest {
  type: EmailType;
  to: string;
  language?: RequestedLang;
  payload?: EmailPayload;
  userId?: string;
}

interface EmailResult {
  subject: string;
  html: string;
  text: string;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const C = {
  bg: '#F4F4F5',
  card: '#FFFFFF',
  fg: '#09090B',
  fg2: '#52525B',
  fg3: '#A1A1AA',
  border: '#E4E4E7',
  cta: '#09090B',
  ctaText: '#FFFFFF',
  successBg: '#F0FDF4',
  successText: '#15803D',
  warningBg: '#FFFBEB',
  warningText: '#B45309',
  dangerBg: '#FEF2F2',
  dangerText: '#B91C1C',
};

function wrap(inner: string, appUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<meta name="x-apple-disable-message-reformatting"/>
<title>Atlas Core</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background-color:${C.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:${C.fg};width:100%}
table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt}
img{border:0;display:block;max-width:100%}
a{text-decoration:none}

.wrapper{background-color:${C.bg};padding:40px 16px 48px}
.card{background-color:${C.card};border-radius:16px;max-width:560px;margin:0 auto;overflow:hidden;border:1px solid ${C.border}}
.hd{padding:32px 40px 0}
.logo{display:inline-flex;align-items:center;gap:9px}
.logo-mark{width:26px;height:26px;background-color:${C.fg};border-radius:7px;display:inline-block;vertical-align:middle}
.logo-name{font-size:14px;font-weight:700;color:${C.fg};letter-spacing:-0.025em;vertical-align:middle}
.bd{padding:32px 40px 40px}
.eyebrow{font-size:11px;font-weight:600;color:${C.fg3};letter-spacing:0.07em;text-transform:uppercase;margin-bottom:14px}
.headline{font-size:26px;font-weight:700;color:${C.fg};letter-spacing:-0.04em;line-height:1.18;margin-bottom:18px}
.rule{width:28px;height:2px;background-color:${C.fg};border-radius:2px;margin-bottom:22px}
.copy{font-size:15px;color:${C.fg2};line-height:1.7;margin-bottom:24px}
.copy b{color:${C.fg};font-weight:600}
.cta-wrap{margin:28px 0}
.cta{display:inline-block;background-color:${C.cta};color:${C.ctaText}!important;font-size:14px;font-weight:600;letter-spacing:-0.01em;padding:13px 26px;border-radius:10px}
.infobox{background-color:${C.bg};border:1px solid ${C.border};border-radius:10px;padding:16px 18px;margin-bottom:24px}
.infobox-row{font-size:13px;color:${C.fg2};padding:6px 0;border-bottom:1px solid ${C.border};display:flex;justify-content:space-between}
.infobox-row:last-child{border-bottom:none}
.infobox-label{color:${C.fg3}}
.infobox-value{color:${C.fg};font-weight:600}
.feat-list{list-style:none;padding:0;margin:0 0 28px}
.feat-list li{font-size:14px;color:${C.fg2};padding:10px 0;border-bottom:1px solid ${C.border};display:flex;align-items:center;gap:10px}
.feat-list li:last-child{border-bottom:none}
.dot{width:5px;height:5px;background-color:${C.fg};border-radius:50%;flex-shrink:0;display:inline-block}
.stats{display:table;width:100%;margin-bottom:24px}
.stat{display:table-cell;text-align:center;padding:16px;background-color:${C.bg};border-radius:10px}
.stat-num{font-size:28px;font-weight:700;color:${C.fg};letter-spacing:-0.04em;line-height:1}
.stat-label{font-size:11px;color:${C.fg3};margin-top:4px;font-weight:500;text-transform:uppercase;letter-spacing:0.06em}
.alert{padding:14px 16px;border-radius:10px;margin-bottom:24px;font-size:14px;line-height:1.6}
.alert-success{background-color:${C.successBg};color:${C.successText}}
.alert-warning{background-color:${C.warningBg};color:${C.warningText}}
.alert-danger{background-color:${C.dangerBg};color:${C.dangerText}}
.ft{padding:22px 40px 32px;border-top:1px solid ${C.border}}
.ft-brand{font-size:12px;font-weight:600;color:${C.fg3};margin-bottom:6px}
.ft-copy{font-size:11px;color:${C.fg3};line-height:1.6}
.ft-copy a{color:${C.fg3};text-decoration:underline}

@media only screen and (max-width:600px){
  .wrapper{padding:24px 10px 32px}
  .hd,.bd,.ft{padding-left:24px;padding-right:24px}
  .headline{font-size:22px}
  .stat{display:block;margin-bottom:8px}
}
</style>
</head>
<body>
<div class="wrapper">
<div class="card">
  <div class="hd">
    <a href="${appUrl}" class="logo" target="_blank" rel="noopener noreferrer">
      <div class="logo-mark"></div>
      <span class="logo-name">Atlas Core</span>
    </a>
  </div>
  ${inner}
  <div class="ft">
    <p class="ft-brand">Atlas Core</p>
    <p class="ft-copy" style="font-style: italic; margin-bottom: 12px;">
      "One visual system from first click to daily use."
    </p>
    <p class="ft-copy">
      © ${new Date().getFullYear()} Atlas Core. All rights reserved.<br/>
      Questions? <a href="mailto:support@useatlascore.com">support@useatlascore.com</a>
      &nbsp;·&nbsp; <a href="${appUrl}">useatlascore.com</a>
    </p>
    <p class="ft-copy" style="margin-top: 16px; font-size: 10px; color: ${C.fg3};">
      Tired of being elite? <a href="${appUrl}/settings/notifications" style="color: ${C.fg3}; text-decoration: underline;">Unsubscribe here</a> and return to mediocrity. We won't judge (much).
    </p>
  </div>
</div>
</div>
</body>
</html>`;
}

function resolveLanguage(_requested?: RequestedLang): RenderLang {
  return 'en';
}

function recipientName(firstName?: string): string {
  return firstName || 'Athlete';
}

function textHeadline(headline: string): string {
  return headline.replace(/<br\/>/g, ' ');
}

function renderFeatureList(features: string[]): string {
  return features.map((feature) => `<li><span class="dot"></span>${feature}</li>`).join('');
}

function renderFeatureText(features: string[]): string {
  return features.map((feature) => `  • ${feature}`).join('\n');
}

function buildWelcome(p: EmailPayload, _lang: RenderLang, appUrl: string): EmailResult {
  const n = recipientName(p.firstName);
  const c = {
    subject: 'Welcome to Atlas Core',
    eyebrow: `Hi ${n},`,
    headline: 'Your training intelligence<br/>starts here.',
    copy1: 'You are not here to log data for the sake of it. You are here to understand what works, double down on it, and move with more clarity. This is your new visual system for performance.',
    copy2: 'Atlas Core brings your workouts, nutrition, lab exams, body measurements, and AI context into one sharp view of your progress. No detached layers, just pure performance data.',
    features: [
      'Workout adherence and training volume tracked over time',
      'Nutrition logging tied directly to your goals',
      'Lab exams and biomarkers in one timeline',
      'Body measurements and visual progress photos',
      'Atlas AI insights across your full context',
    ],
    cta: 'Open Atlas Core →',
    postscript: 'Your 7-day trial starts now. No credit card required.',
  };

  const html = wrap(`
    <div class="bd">
      <p class="eyebrow">${c.eyebrow}</p>
      <h1 class="headline">${c.headline}</h1>
      <div class="rule"></div>
      <p class="copy">${c.copy1}</p>
      <p class="copy">${c.copy2}</p>
      <ul class="feat-list">${renderFeatureList(c.features)}</ul>
      <div class="cta-wrap"><a href="${appUrl}" class="cta" target="_blank" rel="noopener noreferrer">${c.cta}</a></div>
      <p class="copy" style="font-size:13px;color:${C.fg3};margin-top:8px">${c.postscript}</p>
    </div>`, appUrl);

  const text = `${c.eyebrow}\n\n${textHeadline(c.headline)}\n\n${c.copy1}\n\n${c.copy2}\n\n${renderFeatureText(c.features)}\n\n${c.cta}: ${appUrl}\n\n${c.postscript}`;
  return { subject: c.subject, html, text };
}

function buildConfirmEmail(p: EmailPayload, _lang: RenderLang, appUrl: string): EmailResult {
  const n = recipientName(p.firstName);
  const url = p.confirmUrl || appUrl;
  const c = {
    subject: 'Confirm your Atlas Core email',
    eyebrow: `Hi ${n},`,
    headline: 'One click to unlock<br/>everything.',
    copy1: 'You are almost in. Confirm your email address below to activate your account.',
    copy2: 'This link expires in 24 hours. If you did not create an Atlas Core account, you can safely ignore this email.',
    cta: 'Confirm email address →',
    warn: 'If the button does not work, copy and paste this link into your browser:',
  };

  const html = wrap(`
    <div class="bd">
      <p class="eyebrow">${c.eyebrow}</p>
      <h1 class="headline">${c.headline}</h1>
      <div class="rule"></div>
      <p class="copy">${c.copy1}</p>
      <div class="cta-wrap"><a href="${url}" class="cta" target="_blank" rel="noopener noreferrer">${c.cta}</a></div>
      <p class="copy" style="font-size:13px;color:${C.fg3}">${c.copy2}</p>
      <p class="copy" style="font-size:12px;color:${C.fg3};margin-top:16px">${c.warn}<br/>
        <a href="${url}" style="color:${C.fg2};word-break:break-all;font-size:12px">${url}</a>
      </p>
    </div>`, appUrl);

  const text = `${c.eyebrow}\n\n${textHeadline(c.headline)}\n\n${c.copy1}\n\nConfirm here: ${url}\n\n${c.copy2}\n\n${c.warn}\n${url}`;
  return { subject: c.subject, html, text };
}

function buildResetPassword(p: EmailPayload, _lang: RenderLang, appUrl: string): EmailResult {
  const n = recipientName(p.firstName);
  const url = p.resetUrl || appUrl;
  const c = {
    subject: 'Reset your Atlas Core password',
    eyebrow: `Hi ${n},`,
    headline: 'Let us get you<br/>back in.',
    copy1: 'We received a request to reset the password for your Atlas Core account. Use the button below to choose a new password.',
    copy2: 'This link expires in 1 hour. If you did not request a password reset, your account is safe and no action is needed.',
    cta: 'Reset password →',
    warn: 'If the button does not work, copy and paste this link into your browser:',
  };

  const html = wrap(`
    <div class="bd">
      <p class="eyebrow">${c.eyebrow}</p>
      <h1 class="headline">${c.headline}</h1>
      <div class="rule"></div>
      <p class="copy">${c.copy1}</p>
      <div class="cta-wrap"><a href="${url}" class="cta" target="_blank" rel="noopener noreferrer">${c.cta}</a></div>
      <p class="copy" style="font-size:13px;color:${C.fg3}">${c.copy2}</p>
      <p class="copy" style="font-size:12px;color:${C.fg3};margin-top:16px">${c.warn}<br/>
        <a href="${url}" style="color:${C.fg2};word-break:break-all;font-size:12px">${url}</a>
      </p>
    </div>`, appUrl);

  const text = `${c.eyebrow}\n\n${textHeadline(c.headline)}\n\n${c.copy1}\n\nReset here: ${url}\n\n${c.copy2}`;
  return { subject: c.subject, html, text };
}

function buildTrialStarted(p: EmailPayload, _lang: RenderLang, appUrl: string): EmailResult {
  const n = recipientName(p.firstName);
  const days = p.trialDaysLeft ?? 7;
  const c = {
    subject: `Your ${days}-day Atlas Core trial has started`,
    eyebrow: `Hi ${n},`,
    headline: 'Your trial is live.<br/>Make it count.',
    copy1: `You have ${days} days to experience the full Atlas Core system with workouts, nutrition, lab tracking, and AI insights all working together.`,
    copy2: 'Use this window to build a real baseline. Log training, track meals, add measurements, and run your first AI analysis. The context you build now powers everything that follows.',
    features: [
      'Complete onboarding to unlock personalized insights',
      'Log at least 3 workouts to surface adherence patterns',
      'Add your first nutrition day for a more complete picture',
      'Track your body measurements to capture real change',
    ],
    cta: 'Start building your baseline →',
    postscript: `Your trial ends in ${days} days. No charges apply until you choose a plan.`,
  };

  const html = wrap(`
    <div class="bd">
      <p class="eyebrow">${c.eyebrow}</p>
      <h1 class="headline">${c.headline}</h1>
      <div class="rule"></div>
      <p class="copy">${c.copy1}</p>
      <p class="copy">${c.copy2}</p>
      <ul class="feat-list">${renderFeatureList(c.features)}</ul>
      <div class="cta-wrap"><a href="${appUrl}" class="cta" target="_blank" rel="noopener noreferrer">${c.cta}</a></div>
      <p class="copy" style="font-size:13px;color:${C.fg3};margin-top:8px">${c.postscript}</p>
    </div>`, appUrl);

  const text = `${c.eyebrow}\n\n${textHeadline(c.headline)}\n\n${c.copy1}\n\n${c.copy2}\n\n${renderFeatureText(c.features)}\n\n${c.cta}: ${appUrl}\n\n${c.postscript}`;
  return { subject: c.subject, html, text };
}

function buildTrialEnding(p: EmailPayload, _lang: RenderLang, appUrl: string): EmailResult {
  const n = recipientName(p.firstName);
  const days = p.trialDaysLeft ?? 2;
  const pricingUrl = `${appUrl}/pricing`;
  const c = {
    subject: `Your Atlas Core trial ends in ${days} day${days !== 1 ? 's' : ''}`,
    eyebrow: `Hi ${n},`,
    headline: `${days} day${days !== 1 ? 's' : ''} left to decide.<br/>Keep your momentum.`,
    alert: `Your trial expires in ${days} day${days !== 1 ? 's' : ''}.`,
    copy1: `Your Atlas Core trial expires in ${days} day${days !== 1 ? 's' : ''}. Your workouts, nutrition history, progress photos, and AI context stay with you when you upgrade.`,
    copy2: 'If Atlas Core has become part of your system, this is the moment to keep that momentum intact.',
    cta: 'Choose a plan →',
    postscript: 'Questions? Reply to this email or contact support@useatlascore.com.',
  };

  const html = wrap(`
    <div class="bd">
      <p class="eyebrow">${c.eyebrow}</p>
      <h1 class="headline">${c.headline}</h1>
      <div class="rule"></div>
      <div class="alert alert-warning">⏳ ${c.alert}</div>
      <p class="copy">${c.copy1}</p>
      <p class="copy">${c.copy2}</p>
      <div class="cta-wrap"><a href="${pricingUrl}" class="cta" target="_blank" rel="noopener noreferrer">${c.cta}</a></div>
      <p class="copy" style="font-size:13px;color:${C.fg3};margin-top:8px">${c.postscript}</p>
    </div>`, appUrl);

  const text = `${c.eyebrow}\n\n${textHeadline(c.headline)}\n\n${c.alert}\n\n${c.copy1}\n\n${c.copy2}\n\n${c.cta}: ${pricingUrl}\n\n${c.postscript}`;
  return { subject: c.subject, html, text };
}

function buildTrialExpired(p: EmailPayload, _lang: RenderLang, appUrl: string): EmailResult {
  const n = recipientName(p.firstName);
  const pricingUrl = `${appUrl}/pricing`;
  const c = {
    subject: 'Your Atlas Core trial has ended',
    eyebrow: `Hi ${n},`,
    headline: 'Your trial is over.<br/>Your data is not.',
    alert: 'Access is limited for now, but your data is safe.',
    copy1: 'Your trial period has ended. Your account, workouts, nutrition logs, and progress history are still saved and waiting for you.',
    copy2: 'Upgrade whenever you are ready and pick up exactly where you left off.',
    cta: 'Reactivate my account →',
    postscript: 'Need help? Contact support@useatlascore.com.',
  };

  const html = wrap(`
    <div class="bd">
      <p class="eyebrow">${c.eyebrow}</p>
      <h1 class="headline">${c.headline}</h1>
      <div class="rule"></div>
      <div class="alert alert-danger">${c.alert}</div>
      <p class="copy">${c.copy1}</p>
      <p class="copy">${c.copy2}</p>
      <div class="cta-wrap"><a href="${pricingUrl}" class="cta" target="_blank" rel="noopener noreferrer">${c.cta}</a></div>
      <p class="copy" style="font-size:13px;color:${C.fg3};margin-top:8px">${c.postscript}</p>
    </div>`, appUrl);

  const text = `${c.eyebrow}\n\n${textHeadline(c.headline)}\n\n${c.alert}\n\n${c.copy1}\n\n${c.copy2}\n\n${c.cta}: ${pricingUrl}\n\n${c.postscript}`;
  return { subject: c.subject, html, text };
}

function buildPaymentSuccess(p: EmailPayload, _lang: RenderLang, appUrl: string): EmailResult {
  const n = recipientName(p.firstName);
  const plan = p.planName || 'Pro';
  const amount = p.amount || '';
  const invoiceUrl = p.invoiceUrl || appUrl;
  const c = {
    subject: 'Payment confirmed - Atlas Core',
    eyebrow: `Hi ${n},`,
    headline: 'You are active.<br/>Let us build.',
    copy1: `Your ${plan} subscription is active. Thank you for trusting Atlas Core as part of your training system.`,
    rows: [
      ['Plan', plan],
      ['Amount', amount],
      ['Status', 'Active'],
    ].filter((row) => row[1]),
    alert: 'Payment processed successfully',
    cta: 'Open Atlas Core →',
    invoiceCta: 'View invoice',
    postscript: 'This is your payment receipt. Keep it for your records.',
  };

  const rowsHtml = c.rows.map(([label, value]) => `
    <div class="infobox-row">
      <span class="infobox-label">${label}</span>
      <span class="infobox-value">${value}</span>
    </div>`).join('');

  const html = wrap(`
    <div class="bd">
      <p class="eyebrow">${c.eyebrow}</p>
      <h1 class="headline">${c.headline}</h1>
      <div class="rule"></div>
      <div class="alert alert-success">✓ ${c.alert}</div>
      <p class="copy">${c.copy1}</p>
      ${c.rows.length ? `<div class="infobox">${rowsHtml}</div>` : ''}
      <div class="cta-wrap"><a href="${appUrl}" class="cta" target="_blank" rel="noopener noreferrer">${c.cta}</a></div>
      ${p.invoiceUrl ? `<p class="copy" style="font-size:13px;margin-top:12px"><a href="${invoiceUrl}" style="color:${C.fg2};text-decoration:underline">${c.invoiceCta}</a></p>` : ''}
      <p class="copy" style="font-size:13px;color:${C.fg3};margin-top:8px">${c.postscript}</p>
    </div>`, appUrl);

  const text = `${c.eyebrow}\n\n${textHeadline(c.headline)}\n\n${c.alert}\n\n${c.copy1}\n\nPlan: ${plan}\nAmount: ${amount}\nStatus: Active\n\n${c.cta}: ${appUrl}\n\n${c.postscript}`;
  return { subject: c.subject, html, text };
}

function buildPaymentFailed(p: EmailPayload, _lang: RenderLang, appUrl: string): EmailResult {
  const n = recipientName(p.firstName);
  const billingUrl = `${appUrl}/settings/billing`;
  const c = {
    subject: 'Action required - payment failed',
    eyebrow: `Hi ${n},`,
    headline: 'We could not process<br/>your payment.',
    alert: 'Payment failed - action required',
    copy1: 'Your most recent Atlas Core payment failed. This can happen because of an expired card, insufficient funds, or a bank decline.',
    copy2: 'Update your payment method to keep your subscription active. Your data is safe while you sort this out.',
    cta: 'Update payment method →',
    postscript: 'Need help? Contact support@useatlascore.com.',
  };

  const html = wrap(`
    <div class="bd">
      <p class="eyebrow">${c.eyebrow}</p>
      <h1 class="headline">${c.headline}</h1>
      <div class="rule"></div>
      <div class="alert alert-danger">⚠ ${c.alert}</div>
      <p class="copy">${c.copy1}</p>
      <p class="copy">${c.copy2}</p>
      <div class="cta-wrap"><a href="${billingUrl}" class="cta" target="_blank" rel="noopener noreferrer">${c.cta}</a></div>
      <p class="copy" style="font-size:13px;color:${C.fg3};margin-top:8px">${c.postscript}</p>
    </div>`, appUrl);

  const text = `${c.eyebrow}\n\n${textHeadline(c.headline)}\n\n${c.alert}\n\n${c.copy1}\n\n${c.copy2}\n\n${c.cta}: ${billingUrl}\n\n${c.postscript}`;
  return { subject: c.subject, html, text };
}

function buildInactivityNudge(p: EmailPayload, _lang: RenderLang, appUrl: string): EmailResult {
  const n = recipientName(p.firstName);
  const days = p.lastActivityDays ?? 4;
  const c = {
    subject: 'Your training context is waiting for you',
    eyebrow: `Hi ${n},`,
    headline: 'You have been away.<br/>Come back in.',
    copy1: `It has been ${days} days since your last Atlas Core activity. Your training context, nutrition history, and progress data are all right where you left them.`,
    copy2: 'Consistency returns one action at a time. Even one logged session today starts rebuilding momentum.',
    features: [
      'Log any workout',
      'Track today\'s nutrition',
      'Review your weekly progress',
    ],
    cta: 'Pick up where you left off →',
  };

  const html = wrap(`
    <div class="bd">
      <p class="eyebrow">${c.eyebrow}</p>
      <h1 class="headline">${c.headline}</h1>
      <div class="rule"></div>
      <p class="copy">${c.copy1}</p>
      <p class="copy">${c.copy2}</p>
      <ul class="feat-list">${renderFeatureList(c.features)}</ul>
      <div class="cta-wrap"><a href="${appUrl}" class="cta" target="_blank" rel="noopener noreferrer">${c.cta}</a></div>
    </div>`, appUrl);

  const text = `${c.eyebrow}\n\n${textHeadline(c.headline)}\n\n${c.copy1}\n\n${c.copy2}\n\n${renderFeatureText(c.features)}\n\n${c.cta}: ${appUrl}`;
  return { subject: c.subject, html, text };
}

function buildWeeklyReport(p: EmailPayload, _lang: RenderLang, appUrl: string): EmailResult {
  const n = recipientName(p.firstName);
  const workouts = p.weekWorkouts ?? 0;
  const nutritionDays = p.weekNutritionDays ?? 0;
  const weightChange = p.weightChange;
  const streak = p.currentStreak ?? 0;
  const c = {
    subject: 'Your Atlas Core weekly report',
    eyebrow: `Hi ${n},`,
    headline: 'This is what<br/>last week looked like.',
    copy1: 'Here is your weekly summary across workouts, nutrition, and momentum.',
    statWorkouts: 'Workouts',
    statNutrition: 'Nutrition Days',
    statStreak: 'Day Streak',
    statWeight: weightChange !== undefined
      ? (weightChange > 0 ? `+${weightChange.toFixed(1)} kg` : `${weightChange.toFixed(1)} kg`)
      : '—',
    statWeightLabel: 'Weight Change',
    copy2: workouts >= 3
      ? 'Strong week. You are building the consistency that drives everything else.'
      : workouts >= 1
        ? 'You showed up, and that matters. Push for one more session next week.'
        : 'You logged zero workouts this week. Next week is a clean reset.',
    cta: 'View full report →',
  };

  const weightStat = weightChange !== undefined ? `
    <td style="width:25%;padding:0 6px 0 0">
      <div class="stat">
        <div class="stat-num">${c.statWeight}</div>
        <div class="stat-label">${c.statWeightLabel}</div>
      </div>
    </td>` : '';

  const html = wrap(`
    <div class="bd">
      <p class="eyebrow">${c.eyebrow}</p>
      <h1 class="headline">${c.headline}</h1>
      <div class="rule"></div>
      <p class="copy">${c.copy1}</p>
      <table class="stats" style="border-spacing:6px 0;margin:0 0 24px">
        <tr>
          <td style="width:25%;padding:0 6px 0 0">
            <div class="stat">
              <div class="stat-num">${workouts}</div>
              <div class="stat-label">${c.statWorkouts}</div>
            </div>
          </td>
          <td style="width:25%;padding:0 6px">
            <div class="stat">
              <div class="stat-num">${nutritionDays}</div>
              <div class="stat-label">${c.statNutrition}</div>
            </div>
          </td>
          <td style="width:25%;padding:0 6px">
            <div class="stat">
              <div class="stat-num">${streak}</div>
              <div class="stat-label">${c.statStreak}</div>
            </div>
          </td>
          ${weightStat}
        </tr>
      </table>
      <p class="copy">${c.copy2}</p>
      <div class="cta-wrap"><a href="${appUrl}" class="cta" target="_blank" rel="noopener noreferrer">${c.cta}</a></div>
    </div>`, appUrl);

  const weightLine = weightChange !== undefined ? `\n${c.statWeightLabel}: ${c.statWeight}` : '';
  const text = `${c.eyebrow}\n\n${textHeadline(c.headline)}\n\n${c.copy1}\n\n${c.statWorkouts}: ${workouts}\n${c.statNutrition}: ${nutritionDays}\n${c.statStreak}: ${streak}${weightLine}\n\n${c.copy2}\n\n${c.cta}: ${appUrl}`;
  return { subject: c.subject, html, text };
}

function buildMilestone(p: EmailPayload, _lang: RenderLang, appUrl: string): EmailResult {
  const n = recipientName(p.firstName);
  const key = p.milestoneKey || 'first_workout';

  const milestones: Record<string, { badge: string; headline: string; copy: string }> = {
    first_workout: {
      badge: '🏋️ First Workout',
      headline: 'You logged your<br/>first workout.',
      copy: 'Every serious athlete starts with one session. Your training context has officially begun, and the data you log from here creates the picture Atlas AI uses to guide you.',
    },
    workouts_5: {
      badge: '🔥 5 Workouts',
      headline: 'Five workouts in.<br/>The habit is forming.',
      copy: 'Five sessions logged. You are past the hardest part, which is starting. Your consistency data is now meaningful enough to reveal real patterns.',
    },
    workouts_10: {
      badge: '💪 10 Workouts',
      headline: 'Ten sessions.<br/>This is a system now.',
      copy: 'You have logged 10 workouts. That is no longer a streak. That is a system with enough context to surface real insights around volume, recovery, and progression.',
    },
    streak_7: {
      badge: '🗓 7-Day Streak',
      headline: 'Seven days straight.<br/>You are consistent.',
      copy: 'A full week of tracked activity. Consistency is the variable that makes every training and nutrition system work, and you are proving it.',
    },
    streak_14: {
      badge: '⚡ 14-Day Streak',
      headline: 'Two weeks.<br/>This is identity now.',
      copy: 'Fourteen straight days. You have crossed the line from trying to becoming the kind of person who shows up and tracks the work.',
    },
    streak_30: {
      badge: '🏆 30-Day Streak',
      headline: 'Thirty days.<br/>Most people quit. You did not.',
      copy: 'A full month of consistent activity is rare. You now have a powerful baseline, and Atlas AI can use it to generate real, personalized insight.',
    },
  };

  const milestone = milestones[key] || milestones.first_workout;
  const subject = `Milestone: ${milestone.badge}`;
  const cta = 'Keep it going →';

  const html = wrap(`
    <div class="bd">
      <p class="eyebrow" style="font-size:22px;letter-spacing:0;text-transform:none;color:${C.fg};margin-bottom:16px">${milestone.badge}</p>
      <p class="eyebrow">Hi ${n},</p>
      <h1 class="headline">${milestone.headline}</h1>
      <div class="rule"></div>
      <p class="copy">${milestone.copy}</p>
      <div class="cta-wrap"><a href="${appUrl}" class="cta" target="_blank" rel="noopener noreferrer">${cta}</a></div>
    </div>`, appUrl);

  const text = `${milestone.badge}\n\nHi ${n},\n\n${textHeadline(milestone.headline)}\n\n${milestone.copy}\n\n${cta}: ${appUrl}`;
  return { subject, html, text };
}

function build(type: EmailType, payload: EmailPayload, lang: RenderLang, appUrl: string): EmailResult {
  switch (type) {
    case 'welcome':          return buildWelcome(payload, lang, appUrl);
    case 'confirm_email':    return buildConfirmEmail(payload, lang, appUrl);
    case 'reset_password':   return buildResetPassword(payload, lang, appUrl);
    case 'trial_started':    return buildTrialStarted(payload, lang, appUrl);
    case 'trial_ending':     return buildTrialEnding(payload, lang, appUrl);
    case 'trial_expired':    return buildTrialExpired(payload, lang, appUrl);
    case 'payment_success':  return buildPaymentSuccess(payload, lang, appUrl);
    case 'payment_failed':   return buildPaymentFailed(payload, lang, appUrl);
    case 'inactivity_nudge': return buildInactivityNudge(payload, lang, appUrl);
    case 'weekly_report':    return buildWeeklyReport(payload, lang, appUrl);
    case 'milestone':        return buildMilestone(payload, lang, appUrl);
    default:                 throw new Error(`Unknown email type: ${type}`);
  }
}

async function isAuthorized(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return false;

  const token = authHeader.replace('Bearer ', '');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (serviceKey && token === serviceKey) return true;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
  const { error } = await supabase.auth.getUser(token);
  return !error;
}

async function logEvent(opts: {
  userId?: string;
  email: string;
  type: string;
  language: string;
  status: 'sent' | 'failed' | 'skipped';
  resendId?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    await admin.from('email_events').insert({
      user_id: opts.userId || null,
      email: opts.email,
      type: opts.type,
      language: opts.language,
      status: opts.status,
      resend_id: opts.resendId || null,
      error_message: opts.errorMessage || null,
      metadata: opts.metadata || null,
    });
  } catch (error) {
    console.warn('send-email: failed to log email event:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  if (!(await isAuthorized(req))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  let body: EmailRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const { type, to, language = 'en', payload = {}, userId } = body;

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
    return new Response(JSON.stringify({ error: 'Valid recipient email required' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const validTypes: EmailType[] = [
    'welcome',
    'confirm_email',
    'reset_password',
    'trial_started',
    'trial_ending',
    'trial_expired',
    'payment_success',
    'payment_failed',
    'inactivity_nudge',
    'weekly_report',
    'milestone',
  ];

  if (!validTypes.includes(type as EmailType)) {
    return new Response(JSON.stringify({ error: `Invalid email type: ${type}` }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    return new Response(JSON.stringify({ error: 'Email service not configured' }), {
      status: 503,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const appUrl = (payload.appUrl as string | undefined) || Deno.env.get('APP_URL') || 'https://useatlascore.com';
  const lang = resolveLanguage(language);
  const fromAddress = Deno.env.get('FROM_EMAIL') || 'Atlas Core <noreply@useatlascore.com>';

  let email: EmailResult;
  try {
    email = build(type as EmailType, payload, lang, appUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`send-email: template error [${type}]:`, message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [to.trim().toLowerCase()],
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  });

  if (!resendRes.ok) {
    const errText = await resendRes.text();
    console.error(`send-email: Resend error [${type}] ${resendRes.status}:`, errText);
    await logEvent({ userId, email: to, type, language: lang, status: 'failed', errorMessage: errText });
    return new Response(JSON.stringify({ error: 'Email delivery failed' }), {
      status: 502,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const data = await resendRes.json();
  console.log(`send-email: [${type}] -> ${to} (id=${data.id})`);
  await logEvent({ userId, email: to, type, language: lang, status: 'sent', resendId: data.id });

  return new Response(JSON.stringify({ success: true, id: data.id }), {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});
