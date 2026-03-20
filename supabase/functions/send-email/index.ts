/**
 * send-email — Atlas Core Unified Email Dispatcher
 *
 * Handles all 11 transactional email types in English and Portuguese.
 * The Resend API key lives only in Supabase secrets — never reaches the browser.
 *
 * Deploy:
 *   supabase functions deploy send-email
 *
 * Secrets required:
 *   supabase secrets set RESEND_API_KEY=re_xxxx
 *   supabase secrets set FROM_EMAIL="Atlas Core <noreply@atlascore.app>"
 *
 * Payload shape:
 *   POST /functions/v1/send-email
 *   Authorization: Bearer <user_jwt>    (or service role key for internal calls)
 *   { "type": EmailType, "to": "user@example.com", "language": "en"|"pt", "payload": { ... } }
 *
 * Email types:
 *   welcome | confirm_email | reset_password | trial_started | trial_ending
 *   trial_expired | payment_success | payment_failed | inactivity_nudge
 *   weekly_report | milestone
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── Types ─────────────────────────────────────────────────────────────────

type Lang = 'en' | 'pt';

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
  language?: Lang;
  payload?: EmailPayload;
  userId?: string;
}

interface EmailResult {
  subject: string;
  html: string;
  text: string;
}

// ─── CORS ──────────────────────────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ─── Design Tokens ─────────────────────────────────────────────────────────

const C = {
  bg: '#F4F4F5',       // zinc-100 — page background
  card: '#FFFFFF',
  fg: '#09090B',       // zinc-950 — primary text
  fg2: '#52525B',      // zinc-600 — secondary text
  fg3: '#A1A1AA',      // zinc-400 — muted text
  border: '#E4E4E7',   // zinc-200
  cta: '#09090B',      // CTA button background (black)
  ctaText: '#FFFFFF',
  accent: '#18181B',   // zinc-900 — headline accent
  divider: '#E4E4E7',
  successBg: '#F0FDF4',
  successText: '#15803D',
  warningBg: '#FFFBEB',
  warningText: '#B45309',
  dangerBg: '#FEF2F2',
  dangerText: '#B91C1C',
};

// ─── Shared Base Template ──────────────────────────────────────────────────

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

/* Header */
.hd{padding:32px 40px 0}
.logo{display:inline-flex;align-items:center;gap:9px}
.logo-mark{width:26px;height:26px;background-color:${C.fg};border-radius:7px;display:inline-block;vertical-align:middle}
.logo-name{font-size:14px;font-weight:700;color:${C.fg};letter-spacing:-0.025em;vertical-align:middle}

/* Body */
.bd{padding:32px 40px 40px}
.eyebrow{font-size:11px;font-weight:600;color:${C.fg3};letter-spacing:0.07em;text-transform:uppercase;margin-bottom:14px}
.headline{font-size:26px;font-weight:700;color:${C.fg};letter-spacing:-0.04em;line-height:1.18;margin-bottom:18px}
.rule{width:28px;height:2px;background-color:${C.fg};border-radius:2px;margin-bottom:22px}
.copy{font-size:15px;color:${C.fg2};line-height:1.7;margin-bottom:24px}
.copy b{color:${C.fg};font-weight:600}

/* CTA */
.cta-wrap{margin:28px 0}
.cta{display:inline-block;background-color:${C.cta};color:${C.ctaText}!important;font-size:14px;font-weight:600;letter-spacing:-0.01em;padding:13px 26px;border-radius:10px}

/* Info box */
.infobox{background-color:${C.bg};border:1px solid ${C.border};border-radius:10px;padding:16px 18px;margin-bottom:24px}
.infobox-row{font-size:13px;color:${C.fg2};padding:6px 0;border-bottom:1px solid ${C.border};display:flex;justify-content:space-between}
.infobox-row:last-child{border-bottom:none}
.infobox-label{color:${C.fg3}}
.infobox-value{color:${C.fg};font-weight:600}

/* List */
.feat-list{list-style:none;padding:0;margin:0 0 28px}
.feat-list li{font-size:14px;color:${C.fg2};padding:10px 0;border-bottom:1px solid ${C.border};display:flex;align-items:center;gap:10px}
.feat-list li:last-child{border-bottom:none}
.dot{width:5px;height:5px;background-color:${C.fg};border-radius:50%;flex-shrink:0;display:inline-block}

/* Stat block */
.stats{display:table;width:100%;margin-bottom:24px}
.stat{display:table-cell;text-align:center;padding:16px;background-color:${C.bg};border-radius:10px}
.stat-num{font-size:28px;font-weight:700;color:${C.fg};letter-spacing:-0.04em;line-height:1}
.stat-label{font-size:11px;color:${C.fg3};margin-top:4px;font-weight:500;text-transform:uppercase;letter-spacing:0.06em}

/* Alert tones */
.alert{padding:14px 16px;border-radius:10px;margin-bottom:24px;font-size:14px;line-height:1.6}
.alert-success{background-color:${C.successBg};color:${C.successText}}
.alert-warning{background-color:${C.warningBg};color:${C.warningText}}
.alert-danger{background-color:${C.dangerBg};color:${C.dangerText}}

/* Footer */
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
    <p class="ft-copy">
      © ${new Date().getFullYear()} Atlas Core. All rights reserved.<br/>
      Questions? <a href="mailto:support@atlascore.app">support@atlascore.app</a>
      &nbsp;·&nbsp; <a href="${appUrl}">atlascore.app</a>
    </p>
  </div>
</div>
</div>
</body>
</html>`;
}

// ─── Copy (EN + PT) ────────────────────────────────────────────────────────

function name(firstName: string | undefined, lang: Lang): string {
  if (firstName) return firstName;
  return lang === 'pt' ? 'Atleta' : 'Athlete';
}

// ─── Template Builders ─────────────────────────────────────────────────────

function buildWelcome(p: EmailPayload, lang: Lang, appUrl: string): EmailResult {
  const n = name(p.firstName, lang);

  const en = {
    subject: 'Welcome to Atlas Core',
    eyebrow: `Hi ${n},`,
    headline: 'Your training intelligence<br/>starts here.',
    copy1: 'You\'re not here to log data. You\'re here to understand what works — and build on it.',
    copy2: 'Atlas Core connects your workouts, nutrition, lab exams, body measurements, and AI-powered insights into one coherent picture of your progress.',
    features: [
      'Workout adherence and volume, tracked over time',
      'Nutrition logged and tied directly to your goals',
      'Lab exams and biomarkers in a single timeline',
      'Body measurements and visual progress photos',
      'Atlas AI — insights across your entire context',
    ],
    cta: 'Open Atlas Core →',
    postscript: 'Your 7-day trial starts now. No credit card required.',
  };

  const pt = {
    subject: 'Bem-vindo ao Atlas Core',
    eyebrow: `Olá, ${n},`,
    headline: 'Sua inteligência de treino<br/>começa aqui.',
    copy1: 'Você não está aqui para registrar dados. Você está aqui para entender o que funciona — e construir a partir disso.',
    copy2: 'O Atlas Core conecta seus treinos, nutrição, exames laboratoriais, medidas corporais e insights gerados por IA em uma visão coerente do seu progresso.',
    features: [
      'Aderência e volume de treinos registrados ao longo do tempo',
      'Nutrição registrada e conectada diretamente às suas metas',
      'Exames e biomarcadores em uma linha do tempo única',
      'Medidas corporais e fotos de progresso visual',
      'Atlas AI — insights sobre todo o seu contexto',
    ],
    cta: 'Abrir Atlas Core →',
    postscript: 'Seu período de teste de 7 dias começa agora. Sem cartão de crédito.',
  };

  const c = lang === 'pt' ? pt : en;
  const li = c.features.map(f => `<li><span class="dot"></span>${f}</li>`).join('');
  const listText = c.features.map(f => `  • ${f}`).join('\n');

  const html = wrap(`
    <div class="bd">
      <p class="eyebrow">${c.eyebrow}</p>
      <h1 class="headline">${c.headline}</h1>
      <div class="rule"></div>
      <p class="copy">${c.copy1}</p>
      <p class="copy">${c.copy2}</p>
      <ul class="feat-list">${li}</ul>
      <div class="cta-wrap"><a href="${appUrl}" class="cta" target="_blank" rel="noopener noreferrer">${c.cta}</a></div>
      <p class="copy" style="font-size:13px;color:${C.fg3};margin-top:8px">${c.postscript}</p>
    </div>`, appUrl);

  const text = `${c.eyebrow}\n\n${c.headline.replace(/<br\/>/g, ' ')}\n\n${c.copy1}\n\n${c.copy2}\n\n${listText}\n\n${c.cta}: ${appUrl}\n\n${c.postscript}`;

  return { subject: c.subject, html, text };
}

function buildConfirmEmail(p: EmailPayload, lang: Lang, appUrl: string): EmailResult {
  const n = name(p.firstName, lang);
  const url = p.confirmUrl || appUrl;

  const en = {
    subject: 'Confirm your Atlas Core email',
    eyebrow: `Hi ${n},`,
    headline: 'One click to unlock<br/>everything.',
    copy1: 'You\'re almost in. Click the button below to confirm your email address and activate your account.',
    copy2: 'This link expires in 24 hours. If you didn\'t create an Atlas Core account, you can safely ignore this email.',
    cta: 'Confirm email address →',
    warn: 'If the button doesn\'t work, copy and paste this link into your browser:',
  };

  const pt = {
    subject: 'Confirme seu email no Atlas Core',
    eyebrow: `Olá, ${n},`,
    headline: 'Um clique para<br/>desbloquear tudo.',
    copy1: 'Você está quase lá. Clique no botão abaixo para confirmar seu endereço de email e ativar sua conta.',
    copy2: 'Este link expira em 24 horas. Se você não criou uma conta no Atlas Core, pode ignorar este email com segurança.',
    cta: 'Confirmar endereço de email →',
    warn: 'Se o botão não funcionar, copie e cole este link no seu navegador:',
  };

  const c = lang === 'pt' ? pt : en;

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

  const text = `${c.eyebrow}\n\n${c.headline.replace(/<br\/>/g, ' ')}\n\n${c.copy1}\n\nConfirm here: ${url}\n\n${c.copy2}\n\n${c.warn}\n${url}`;

  return { subject: c.subject, html, text };
}

function buildResetPassword(p: EmailPayload, lang: Lang, appUrl: string): EmailResult {
  const n = name(p.firstName, lang);
  const url = p.resetUrl || appUrl;

  const en = {
    subject: 'Reset your Atlas Core password',
    eyebrow: `Hi ${n},`,
    headline: 'Let\'s get you<br/>back in.',
    copy1: 'We received a request to reset the password for your Atlas Core account. Click the button below to choose a new password.',
    copy2: 'This link expires in 1 hour. If you didn\'t request a password reset, your account is safe — no action is needed.',
    cta: 'Reset password →',
    warn: 'If the button doesn\'t work, copy and paste this link into your browser:',
  };

  const pt = {
    subject: 'Redefinir senha do Atlas Core',
    eyebrow: `Olá, ${n},`,
    headline: 'Vamos fazer você<br/>entrar de volta.',
    copy1: 'Recebemos uma solicitação para redefinir a senha da sua conta Atlas Core. Clique no botão abaixo para escolher uma nova senha.',
    copy2: 'Este link expira em 1 hora. Se você não solicitou a redefinição de senha, sua conta está segura — nenhuma ação é necessária.',
    cta: 'Redefinir senha →',
    warn: 'Se o botão não funcionar, copie e cole este link no seu navegador:',
  };

  const c = lang === 'pt' ? pt : en;

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

  const text = `${c.eyebrow}\n\n${c.headline.replace(/<br\/>/g, ' ')}\n\n${c.copy1}\n\nReset here: ${url}\n\n${c.copy2}`;

  return { subject: c.subject, html, text };
}

function buildTrialStarted(p: EmailPayload, lang: Lang, appUrl: string): EmailResult {
  const n = name(p.firstName, lang);
  const days = p.trialDaysLeft ?? 7;

  const en = {
    subject: `Your ${days}-day Atlas Core trial has started`,
    eyebrow: `Hi ${n},`,
    headline: 'Your trial is live.<br/>Make it count.',
    copy1: `You have ${days} days to experience the full Atlas Core system — workouts, nutrition, lab tracking, and AI insights all working together.`,
    copy2: 'Use this time to build a baseline. Track one full week of training. Log your meals. Run your first AI analysis. The data you enter now becomes the foundation that makes everything else more powerful.',
    features: [
      'Complete your onboarding to unlock personalized insights',
      'Log at least 3 workouts to see adherence trends',
      'Add your first nutrition day for a complete picture',
      'Connect your body measurements to track real change',
    ],
    cta: 'Start building your baseline →',
    postscript: `Trial ends in ${days} days. No charges until you choose a plan.`,
  };

  const pt = {
    subject: `Seu teste de ${days} dias no Atlas Core começou`,
    eyebrow: `Olá, ${n},`,
    headline: 'Seu teste está ativo.<br/>Aproveite ao máximo.',
    copy1: `Você tem ${days} dias para experimentar o sistema completo do Atlas Core — treinos, nutrição, exames e insights de IA, tudo funcionando em conjunto.`,
    copy2: 'Use este tempo para construir uma linha de base. Registre uma semana completa de treino. Anote suas refeições. Execute sua primeira análise de IA. Os dados que você inserir agora se tornam a base que torna tudo mais poderoso.',
    features: [
      'Conclua o onboarding para desbloquear insights personalizados',
      'Registre pelo menos 3 treinos para ver tendências de aderência',
      'Adicione seu primeiro dia de nutrição para ter uma visão completa',
      'Conecte suas medidas corporais para acompanhar mudanças reais',
    ],
    cta: 'Começar a construir sua linha de base →',
    postscript: `O teste termina em ${days} dias. Sem cobranças até você escolher um plano.`,
  };

  const c = lang === 'pt' ? pt : en;
  const li = c.features.map(f => `<li><span class="dot"></span>${f}</li>`).join('');

  const html = wrap(`
    <div class="bd">
      <p class="eyebrow">${c.eyebrow}</p>
      <h1 class="headline">${c.headline}</h1>
      <div class="rule"></div>
      <p class="copy">${c.copy1}</p>
      <p class="copy">${c.copy2}</p>
      <ul class="feat-list">${li}</ul>
      <div class="cta-wrap"><a href="${appUrl}" class="cta" target="_blank" rel="noopener noreferrer">${c.cta}</a></div>
      <p class="copy" style="font-size:13px;color:${C.fg3};margin-top:8px">${c.postscript}</p>
    </div>`, appUrl);

  const text = `${c.eyebrow}\n\n${c.headline.replace(/<br\/>/g, ' ')}\n\n${c.copy1}\n\n${c.copy2}\n\n${c.cta}: ${appUrl}\n\n${c.postscript}`;

  return { subject: c.subject, html, text };
}

function buildTrialEnding(p: EmailPayload, lang: Lang, appUrl: string): EmailResult {
  const n = name(p.firstName, lang);
  const days = p.trialDaysLeft ?? 2;
  const pricingUrl = `${appUrl}/pricing`;

  const en = {
    subject: `Your Atlas Core trial ends in ${days} day${days !== 1 ? 's' : ''}`,
    eyebrow: `Hi ${n},`,
    headline: `${days} day${days !== 1 ? 's' : ''} left to decide.<br/>Don't lose your data.`,
    copy1: `Your Atlas Core trial expires in ${days} day${days !== 1 ? 's' : ''}. Everything you've built — your workouts, nutrition logs, progress photos, and AI context — stays with you when you upgrade.`,
    copy2: 'Your training, nutrition, and progress — finally connected. Keep the momentum going.',
    cta: 'Choose a plan →',
    postscript: 'Questions? Reply to this email or reach us at support@atlascore.app',
  };

  const pt = {
    subject: `Seu teste no Atlas Core termina em ${days} dia${days !== 1 ? 's' : ''}`,
    eyebrow: `Olá, ${n},`,
    headline: `${days} dia${days !== 1 ? 's' : ''} para decidir.<br/>Não perca seus dados.`,
    copy1: `Seu teste no Atlas Core expira em ${days} dia${days !== 1 ? 's' : ''}. Tudo que você construiu — treinos, registros de nutrição, fotos de progresso e contexto de IA — fica com você quando você fizer o upgrade.`,
    copy2: 'Seu treino, nutrição e progresso — finalmente conectados. Mantenha o ritmo.',
    cta: 'Escolher um plano →',
    postscript: 'Dúvidas? Responda este email ou fale com a gente em support@atlascore.app',
  };

  const c = lang === 'pt' ? pt : en;

  const html = wrap(`
    <div class="bd">
      <p class="eyebrow">${c.eyebrow}</p>
      <h1 class="headline">${c.headline}</h1>
      <div class="rule"></div>
      <div class="alert alert-warning">⏳ ${lang === 'pt' ? `Seu teste expira em ${days} dia${days !== 1 ? 's' : ''}` : `Your trial expires in ${days} day${days !== 1 ? 's' : ''}`}</div>
      <p class="copy">${c.copy1}</p>
      <p class="copy">${c.copy2}</p>
      <div class="cta-wrap"><a href="${pricingUrl}" class="cta" target="_blank" rel="noopener noreferrer">${c.cta}</a></div>
      <p class="copy" style="font-size:13px;color:${C.fg3};margin-top:8px">${c.postscript}</p>
    </div>`, appUrl);

  const text = `${c.eyebrow}\n\n${c.headline.replace(/<br\/>/g, ' ')}\n\n${c.copy1}\n\n${c.copy2}\n\n${c.cta}: ${pricingUrl}\n\n${c.postscript}`;

  return { subject: c.subject, html, text };
}

function buildTrialExpired(p: EmailPayload, lang: Lang, appUrl: string): EmailResult {
  const n = name(p.firstName, lang);
  const pricingUrl = `${appUrl}/pricing`;

  const en = {
    subject: 'Your Atlas Core trial has ended',
    eyebrow: `Hi ${n},`,
    headline: 'Your trial is over.<br/>Your data isn\'t.',
    copy1: 'Your trial period has ended. Your account and all your data — workouts, nutrition logs, progress history — are safely saved and waiting for you.',
    copy2: 'Upgrade now to get back to the system you were building. Your training, nutrition, and progress — finally connected.',
    cta: 'Reactivate my account →',
    postscript: 'Need help? support@atlascore.app',
  };

  const pt = {
    subject: 'Seu teste no Atlas Core terminou',
    eyebrow: `Olá, ${n},`,
    headline: 'Seu teste acabou.<br/>Seus dados, não.',
    copy1: 'Seu período de teste encerrou. Sua conta e todos os seus dados — treinos, registros de nutrição, histórico de progresso — estão salvos com segurança e esperando por você.',
    copy2: 'Faça o upgrade agora para voltar ao sistema que você estava construindo. Seu treino, nutrição e progresso — finalmente conectados.',
    cta: 'Reativar minha conta →',
    postscript: 'Precisa de ajuda? support@atlascore.app',
  };

  const c = lang === 'pt' ? pt : en;

  const html = wrap(`
    <div class="bd">
      <p class="eyebrow">${c.eyebrow}</p>
      <h1 class="headline">${c.headline}</h1>
      <div class="rule"></div>
      <div class="alert alert-danger">${lang === 'pt' ? 'Acesso limitado. Seus dados estão intactos.' : 'Access limited. Your data is intact.'}</div>
      <p class="copy">${c.copy1}</p>
      <p class="copy">${c.copy2}</p>
      <div class="cta-wrap"><a href="${pricingUrl}" class="cta" target="_blank" rel="noopener noreferrer">${c.cta}</a></div>
      <p class="copy" style="font-size:13px;color:${C.fg3};margin-top:8px">${c.postscript}</p>
    </div>`, appUrl);

  const text = `${c.eyebrow}\n\n${c.headline.replace(/<br\/>/g, ' ')}\n\n${c.copy1}\n\n${c.copy2}\n\n${c.cta}: ${pricingUrl}\n\n${c.postscript}`;

  return { subject: c.subject, html, text };
}

function buildPaymentSuccess(p: EmailPayload, lang: Lang, appUrl: string): EmailResult {
  const n = name(p.firstName, lang);
  const plan = p.planName || (lang === 'pt' ? 'Pro' : 'Pro');
  const amount = p.amount || '';
  const invoiceUrl = p.invoiceUrl || appUrl;

  const en = {
    subject: 'Payment confirmed — Atlas Core',
    eyebrow: `Hi ${n},`,
    headline: 'You\'re active.<br/>Let\'s build.',
    copy1: `Your ${plan} subscription is active. Thank you for trusting Atlas Core to be part of your training system.`,
    rows: [
      ['Plan', plan],
      ['Amount', amount],
      ['Status', 'Active'],
    ].filter(r => r[1]),
    cta: 'Open Atlas Core →',
    invoiceCta: 'View invoice',
    postscript: 'This is your payment receipt. Keep it for your records.',
  };

  const pt = {
    subject: 'Pagamento confirmado — Atlas Core',
    eyebrow: `Olá, ${n},`,
    headline: 'Você está ativo.<br/>Vamos construir.',
    copy1: `Sua assinatura ${plan} está ativa. Obrigado por confiar no Atlas Core como parte do seu sistema de treino.`,
    rows: [
      ['Plano', plan],
      ['Valor', amount],
      ['Status', 'Ativo'],
    ].filter(r => r[1]),
    cta: 'Abrir Atlas Core →',
    invoiceCta: 'Ver recibo',
    postscript: 'Este é o seu comprovante de pagamento. Guarde-o para seus registros.',
  };

  const c = lang === 'pt' ? pt : en;
  const rowsHtml = c.rows.map(([label, val]) => `
    <div class="infobox-row">
      <span class="infobox-label">${label}</span>
      <span class="infobox-value">${val}</span>
    </div>`).join('');

  const html = wrap(`
    <div class="bd">
      <p class="eyebrow">${c.eyebrow}</p>
      <h1 class="headline">${c.headline}</h1>
      <div class="rule"></div>
      <div class="alert alert-success">✓ ${lang === 'pt' ? 'Pagamento processado com sucesso' : 'Payment processed successfully'}</div>
      <p class="copy">${c.copy1}</p>
      ${c.rows.length ? `<div class="infobox">${rowsHtml}</div>` : ''}
      <div class="cta-wrap"><a href="${appUrl}" class="cta" target="_blank" rel="noopener noreferrer">${c.cta}</a></div>
      ${p.invoiceUrl ? `<p class="copy" style="font-size:13px;margin-top:12px"><a href="${invoiceUrl}" style="color:${C.fg2};text-decoration:underline">${c.invoiceCta}</a></p>` : ''}
      <p class="copy" style="font-size:13px;color:${C.fg3};margin-top:8px">${c.postscript}</p>
    </div>`, appUrl);

  const text = `${c.eyebrow}\n\n${c.headline.replace(/<br\/>/g, ' ')}\n\n${c.copy1}\n\nPlan: ${plan}\nAmount: ${amount}\n\n${c.cta}: ${appUrl}\n\n${c.postscript}`;

  return { subject: c.subject, html, text };
}

function buildPaymentFailed(p: EmailPayload, lang: Lang, appUrl: string): EmailResult {
  const n = name(p.firstName, lang);
  const pricingUrl = `${appUrl}/settings/billing`;

  const en = {
    subject: 'Action required — payment failed',
    eyebrow: `Hi ${n},`,
    headline: 'We couldn\'t process<br/>your payment.',
    copy1: 'Your most recent payment for Atlas Core failed. This can happen due to an expired card, insufficient funds, or a bank decline.',
    copy2: 'Update your payment method to keep your subscription active. Your data is safe — we\'ll hold everything for you while you sort this out.',
    cta: 'Update payment method →',
    postscript: 'Need help? Contact us at support@atlascore.app',
  };

  const pt = {
    subject: 'Ação necessária — pagamento não processado',
    eyebrow: `Olá, ${n},`,
    headline: 'Não conseguimos processar<br/>seu pagamento.',
    copy1: 'Seu pagamento mais recente do Atlas Core falhou. Isso pode acontecer por cartão expirado, saldo insuficiente ou recusa do banco.',
    copy2: 'Atualize sua forma de pagamento para manter sua assinatura ativa. Seus dados estão seguros — guardaremos tudo enquanto você resolve isso.',
    cta: 'Atualizar forma de pagamento →',
    postscript: 'Precisa de ajuda? Fale conosco em support@atlascore.app',
  };

  const c = lang === 'pt' ? pt : en;

  const html = wrap(`
    <div class="bd">
      <p class="eyebrow">${c.eyebrow}</p>
      <h1 class="headline">${c.headline}</h1>
      <div class="rule"></div>
      <div class="alert alert-danger">⚠ ${lang === 'pt' ? 'Pagamento não processado — ação necessária' : 'Payment failed — action required'}</div>
      <p class="copy">${c.copy1}</p>
      <p class="copy">${c.copy2}</p>
      <div class="cta-wrap"><a href="${pricingUrl}" class="cta" target="_blank" rel="noopener noreferrer">${c.cta}</a></div>
      <p class="copy" style="font-size:13px;color:${C.fg3};margin-top:8px">${c.postscript}</p>
    </div>`, appUrl);

  const text = `${c.eyebrow}\n\n${c.headline.replace(/<br\/>/g, ' ')}\n\n${c.copy1}\n\n${c.copy2}\n\n${c.cta}: ${pricingUrl}\n\n${c.postscript}`;

  return { subject: c.subject, html, text };
}

function buildInactivityNudge(p: EmailPayload, lang: Lang, appUrl: string): EmailResult {
  const n = name(p.firstName, lang);
  const days = p.lastActivityDays ?? 4;

  const en = {
    subject: 'Your training context is waiting for you',
    eyebrow: `Hi ${n},`,
    headline: 'You\'ve been away.<br/>Come back.',
    copy1: `It's been ${days} days since your last activity on Atlas Core. Your training context, nutrition history, and progress data are all waiting — exactly where you left them.`,
    copy2: 'Consistency is built in small steps. Even one logged session today puts you back on track.',
    features: [
      'Log a workout — any workout',
      'Track today\'s nutrition',
      'Check your weekly progress',
    ],
    cta: 'Pick up where you left off →',
  };

  const pt = {
    subject: 'Seu contexto de treino está esperando por você',
    eyebrow: `Olá, ${n},`,
    headline: 'Você esteve ausente.<br/>Volte.',
    copy1: `Faz ${days} dias desde sua última atividade no Atlas Core. Seu contexto de treino, histórico de nutrição e dados de progresso estão todos esperando — exatamente onde você os deixou.`,
    copy2: 'A consistência é construída em pequenos passos. Mesmo uma sessão registrada hoje já te coloca de volta nos trilhos.',
    features: [
      'Registre um treino — qualquer treino',
      'Acompanhe a nutrição de hoje',
      'Verifique seu progresso semanal',
    ],
    cta: 'Retome de onde parou →',
  };

  const c = lang === 'pt' ? pt : en;
  const li = c.features.map(f => `<li><span class="dot"></span>${f}</li>`).join('');

  const html = wrap(`
    <div class="bd">
      <p class="eyebrow">${c.eyebrow}</p>
      <h1 class="headline">${c.headline}</h1>
      <div class="rule"></div>
      <p class="copy">${c.copy1}</p>
      <p class="copy">${c.copy2}</p>
      <ul class="feat-list">${li}</ul>
      <div class="cta-wrap"><a href="${appUrl}" class="cta" target="_blank" rel="noopener noreferrer">${c.cta}</a></div>
    </div>`, appUrl);

  const text = `${c.eyebrow}\n\n${c.headline.replace(/<br\/>/g, ' ')}\n\n${c.copy1}\n\n${c.copy2}\n\n${c.cta}: ${appUrl}`;

  return { subject: c.subject, html, text };
}

function buildWeeklyReport(p: EmailPayload, lang: Lang, appUrl: string): EmailResult {
  const n = name(p.firstName, lang);
  const workouts = p.weekWorkouts ?? 0;
  const nutritionDays = p.weekNutritionDays ?? 0;
  const weightChange = p.weightChange;
  const streak = p.currentStreak ?? 0;

  const en = {
    subject: 'Your Atlas Core weekly report',
    eyebrow: `Hi ${n},`,
    headline: 'This is what<br/>last week looked like.',
    copy1: 'Your weekly summary — workouts, nutrition, and momentum. Here\'s how your body and consistency performed.',
    statWorkouts: 'Workouts',
    statNutrition: 'Nutrition Days',
    statStreak: 'Day Streak',
    statWeight: weightChange !== undefined
      ? (weightChange > 0 ? `+${weightChange.toFixed(1)} kg` : `${weightChange.toFixed(1)} kg`)
      : '—',
    statWeightLabel: 'Weight Change',
    copy2: workouts >= 3
      ? 'Solid week. You\'re building the habit that makes everything else possible.'
      : workouts >= 1
        ? 'You showed up. That counts. Push for one more session next week.'
        : 'The data shows zero workouts this week. Next week is a fresh start — let\'s make it count.',
    cta: 'View full report →',
  };

  const pt = {
    subject: 'Seu relatório semanal no Atlas Core',
    eyebrow: `Olá, ${n},`,
    headline: 'É isso que a<br/>semana passada pareceu.',
    copy1: 'Seu resumo semanal — treinos, nutrição e ritmo. Veja como seu corpo e consistência performaram.',
    statWorkouts: 'Treinos',
    statNutrition: 'Dias de Nutrição',
    statStreak: 'Dias Seguidos',
    statWeight: weightChange !== undefined
      ? (weightChange > 0 ? `+${weightChange.toFixed(1)} kg` : `${weightChange.toFixed(1)} kg`)
      : '—',
    statWeightLabel: 'Variação de Peso',
    copy2: workouts >= 3
      ? 'Semana sólida. Você está construindo o hábito que torna tudo o mais possível.'
      : workouts >= 1
        ? 'Você apareceu. Isso conta. Busque mais uma sessão na próxima semana.'
        : 'Os dados mostram zero treinos esta semana. A próxima semana é um recomeço — vamos aproveitar.',
    cta: 'Ver relatório completo →',
  };

  const c = lang === 'pt' ? pt : en;

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
  const text = `${c.eyebrow}\n\n${c.headline.replace(/<br\/>/g, ' ')}\n\n${c.copy1}\n\n${c.statWorkouts}: ${workouts}\n${c.statNutrition}: ${nutritionDays}\n${c.statStreak}: ${streak}${weightLine}\n\n${c.copy2}\n\n${c.cta}: ${appUrl}`;

  return { subject: c.subject, html, text };
}

function buildMilestone(p: EmailPayload, lang: Lang, appUrl: string): EmailResult {
  const n = name(p.firstName, lang);
  const key = p.milestoneKey || 'first_workout';

  const milestones: Record<string, { en: { headline: string; copy: string; badge: string }; pt: { headline: string; copy: string; badge: string } }> = {
    first_workout: {
      en: {
        badge: '🏋️ First Workout',
        headline: 'You logged your<br/>first workout.',
        copy: 'Every elite athlete started exactly where you are right now — with one session. Your training context has officially begun. The data you log today builds the picture that Atlas AI will use to guide you.',
      },
      pt: {
        badge: '🏋️ Primeiro Treino',
        headline: 'Você registrou<br/>seu primeiro treino.',
        copy: 'Todo atleta de elite começou exatamente onde você está agora — com uma sessão. Seu contexto de treino começou oficialmente. Os dados que você registra hoje constroem a imagem que o Atlas AI usará para guiá-lo.',
      },
    },
    workouts_5: {
      en: {
        badge: '🔥 5 Workouts',
        headline: '5 workouts in.<br/>The habit is forming.',
        copy: 'Five sessions logged. You\'re past the hardest part — starting. Your consistency data is now meaningful enough for Atlas AI to begin identifying real patterns in your training.',
      },
      pt: {
        badge: '🔥 5 Treinos',
        headline: '5 treinos feitos.<br/>O hábito está se formando.',
        copy: 'Cinco sessões registradas. Você passou pela parte mais difícil — começar. Seus dados de consistência agora são significativos o suficiente para o Atlas AI começar a identificar padrões reais no seu treino.',
      },
    },
    workouts_10: {
      en: {
        badge: '💪 10 Workouts',
        headline: 'Ten sessions.<br/>This is a system now.',
        copy: 'You\'ve logged 10 workouts. That\'s not a streak — that\'s a system. Atlas AI now has enough context to surface meaningful insights about your volume, recovery, and progression patterns.',
      },
      pt: {
        badge: '💪 10 Treinos',
        headline: 'Dez sessões.<br/>Isso é um sistema agora.',
        copy: 'Você registrou 10 treinos. Isso não é uma sequência — é um sistema. O Atlas AI agora tem contexto suficiente para apresentar insights significativos sobre seu volume, recuperação e padrões de progressão.',
      },
    },
    streak_7: {
      en: {
        badge: '🗓 7-Day Streak',
        headline: 'Seven days straight.<br/>You\'re consistent.',
        copy: 'A full week of activity — logged and tracked. Consistency is the single most important variable in any training or nutrition system. You\'re proving it.',
      },
      pt: {
        badge: '🗓 7 Dias Seguidos',
        headline: 'Sete dias seguidos.<br/>Você é consistente.',
        copy: 'Uma semana completa de atividade — registrada e acompanhada. A consistência é a variável mais importante em qualquer sistema de treino ou nutrição. Você está provando isso.',
      },
    },
    streak_14: {
      en: {
        badge: '⚡ 14-Day Streak',
        headline: 'Two weeks.<br/>This is identity now.',
        copy: 'Fourteen consecutive days. You\'ve crossed the threshold from habit to identity. This is who you are now — someone who shows up, logs the data, and tracks the progress.',
      },
      pt: {
        badge: '⚡ 14 Dias Seguidos',
        headline: 'Duas semanas.<br/>Isso é identidade agora.',
        copy: 'Quatorze dias consecutivos. Você cruzou o limite do hábito para a identidade. Isso é quem você é agora — alguém que aparece, registra os dados e acompanha o progresso.',
      },
    },
    streak_30: {
      en: {
        badge: '🏆 30-Day Streak',
        headline: 'Thirty days.<br/>Most people quit. You didn\'t.',
        copy: 'A full month of consistent activity. You\'re in rare company. The data you\'ve accumulated over 30 days is now a powerful baseline — Atlas AI can give you real, meaningful, personalized insights.',
      },
      pt: {
        badge: '🏆 30 Dias Seguidos',
        headline: 'Trinta dias.<br/>A maioria desiste. Você não.',
        copy: 'Um mês completo de atividade consistente. Você está em uma companhia rara. Os dados que você acumulou em 30 dias agora são uma linha de base poderosa — o Atlas AI pode fornecer insights reais, significativos e personalizados.',
      },
    },
  };

  const m = milestones[key] || milestones.first_workout;
  const copy = lang === 'pt' ? m.pt : m.en;

  const en = { subject: `Milestone: ${copy.badge}`, cta: 'Keep it going →' };
  const pt = { subject: `Conquista: ${copy.badge}`, cta: 'Continue assim →' };
  const labels = lang === 'pt' ? pt : en;

  const html = wrap(`
    <div class="bd">
      <p class="eyebrow" style="font-size:22px;letter-spacing:0;text-transform:none;color:${C.fg};margin-bottom:16px">${copy.badge}</p>
      <p class="eyebrow">${lang === 'pt' ? `Olá, ${n},` : `Hi ${n},`}</p>
      <h1 class="headline">${copy.headline}</h1>
      <div class="rule"></div>
      <p class="copy">${copy.copy}</p>
      <div class="cta-wrap"><a href="${appUrl}" class="cta" target="_blank" rel="noopener noreferrer">${labels.cta}</a></div>
    </div>`, appUrl);

  const text = `${copy.badge}\n\n${lang === 'pt' ? `Olá, ${n},` : `Hi ${n},`}\n\n${copy.headline.replace(/<br\/>/g, ' ')}\n\n${copy.copy}\n\n${labels.cta}: ${appUrl}`;

  return { subject: labels.subject, html, text };
}

// ─── Router ────────────────────────────────────────────────────────────────

function build(type: EmailType, payload: EmailPayload, lang: Lang, appUrl: string): EmailResult {
  switch (type) {
    case 'welcome':         return buildWelcome(payload, lang, appUrl);
    case 'confirm_email':   return buildConfirmEmail(payload, lang, appUrl);
    case 'reset_password':  return buildResetPassword(payload, lang, appUrl);
    case 'trial_started':   return buildTrialStarted(payload, lang, appUrl);
    case 'trial_ending':    return buildTrialEnding(payload, lang, appUrl);
    case 'trial_expired':   return buildTrialExpired(payload, lang, appUrl);
    case 'payment_success': return buildPaymentSuccess(payload, lang, appUrl);
    case 'payment_failed':  return buildPaymentFailed(payload, lang, appUrl);
    case 'inactivity_nudge':return buildInactivityNudge(payload, lang, appUrl);
    case 'weekly_report':   return buildWeeklyReport(payload, lang, appUrl);
    case 'milestone':       return buildMilestone(payload, lang, appUrl);
    default:                throw new Error(`Unknown email type: ${type}`);
  }
}

// ─── Auth helpers ──────────────────────────────────────────────────────────

// Returns true if the caller is authenticated OR is using the service role key.
// Service role callers (internal edge functions, cron jobs) bypass user auth.
async function isAuthorized(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return false;

  const token = authHeader.replace('Bearer ', '');

  // Service role key — always authorized
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (serviceKey && token === serviceKey) return true;

  // User JWT — validate via Supabase auth
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
  const { error } = await supabase.auth.getUser(token);
  return !error;
}

// ─── Log event helper ──────────────────────────────────────────────────────

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
  } catch (e) {
    console.warn('send-email: failed to log email event:', e);
  }
}

// ─── Handler ───────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  if (!(await isAuthorized(req))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  let body: EmailRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const { type, to, language = 'en', payload = {}, userId } = body;

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
    return new Response(JSON.stringify({ error: 'Valid recipient email required' }), {
      status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const validTypes: EmailType[] = [
    'welcome', 'confirm_email', 'reset_password', 'trial_started', 'trial_ending',
    'trial_expired', 'payment_success', 'payment_failed', 'inactivity_nudge',
    'weekly_report', 'milestone',
  ];
  if (!validTypes.includes(type as EmailType)) {
    return new Response(JSON.stringify({ error: `Invalid email type: ${type}` }), {
      status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    return new Response(JSON.stringify({ error: 'Email service not configured' }), {
      status: 503, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const appUrl = (payload.appUrl as string | undefined) || Deno.env.get('APP_URL') || 'https://atlascore.app';
  const lang: Lang = language === 'pt' ? 'pt' : 'en';
  const fromAddress = Deno.env.get('FROM_EMAIL') || 'Atlas Core <noreply@atlascore.app>';

  let email: EmailResult;
  try {
    email = build(type as EmailType, payload, lang, appUrl);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`send-email: template error [${type}]:`, msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
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
      status: 502, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const data = await resendRes.json();
  console.log(`send-email: ✓ [${type}] → ${to} (id=${data.id})`);
  await logEvent({ userId, email: to, type, language: lang, status: 'sent', resendId: data.id });

  return new Response(JSON.stringify({ success: true, id: data.id }), {
    status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});
