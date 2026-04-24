/**
 * send-email - Atlas Core unified email dispatcher
 *
 * Uses the shared paper / ink / sulfur renderer as the only visual system.
 *
 * Deploy:
 *   supabase functions deploy send-email
 *
 * Secrets required:
 *   supabase secrets set RESEND_API_KEY=re_xxxx
 *   supabase secrets set FROM_EMAIL="atlas.core <noreply@useatlascore.com>"
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { renderBrandedEmail, renderEmail } from '../_shared/templates.ts';

type RequestedLang = string;
type RenderLang = 'pt-BR' | 'en';

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

function resolveLanguage(requested?: RequestedLang): RenderLang {
  return requested?.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
}

function formatTrialWindow(days: number, trialEndsAt: string | undefined, lang: RenderLang): string {
  if (trialEndsAt) return trialEndsAt;
  return lang === 'pt-BR' ? `${days} dias` : `${days} days`;
}

function buildStandardTemplate(
  type:
    | 'welcome'
    | 'confirm_email'
    | 'reset_password'
    | 'trial_started'
    | 'trial_ending'
    | 'trial_expired'
    | 'inactivity_nudge',
  payload: EmailPayload,
  lang: RenderLang,
): EmailResult {
  const days = payload.trialDaysLeft ?? (type === 'trial_ending' ? 2 : 7);

  return renderEmail(type, lang, {
    first_name: String(payload.firstName ?? ''),
    confirm_email_url: String(payload.confirmUrl ?? payload.appUrl ?? ''),
    reset_password_url: String(payload.resetUrl ?? payload.appUrl ?? ''),
    trial_end_date: formatTrialWindow(days, payload.trialEndsAt, lang),
    trial_days_left: String(days),
    retry_date: String(payload['retryDate'] ?? ''),
    access_end_date: String(payload['accessEndDate'] ?? ''),
    report_date_range: String(payload['reportDateRange'] ?? ''),
    weekly_report_url: String(payload['weeklyReportUrl'] ?? payload.appUrl ?? ''),
  });
}

function buildPaymentSuccess(payload: EmailPayload, lang: RenderLang, appUrl: string): EmailResult {
  const plan = String(payload.planName ?? 'Pro');
  const amount = String(payload.amount ?? '');
  const invoiceUrl = String(payload.invoiceUrl ?? '');

  return renderBrandedEmail({
    locale: lang,
    subject: lang === 'pt-BR' ? 'atlas.core — pagamento confirmado' : 'atlas.core — payment confirmed',
    preheader:
      lang === 'pt-BR'
        ? 'Sua assinatura segue ativa.'
        : 'Your subscription remains active.',
    headline:
      lang === 'pt-BR'
        ? 'Pagamento confirmado'
        : 'Payment confirmed',
    body:
      lang === 'pt-BR'
        ? [
            'Seu pagamento foi processado com sucesso.',
            amount
              ? `Plano ${plan}. Valor ${amount}.`
              : `Seu plano ${plan} segue ativo.`,
            'Nenhuma outra ação é necessária agora.',
          ]
        : [
            'Your payment was processed successfully.',
            amount
              ? `Plan ${plan}. Amount ${amount}.`
              : `Your ${plan} plan remains active.`,
            'Nothing else is required right now.',
          ],
    ctaLabel: lang === 'pt-BR' ? 'Abrir cobrança' : 'Open billing',
    ctaUrl: `${appUrl}/billing`,
    secondaryCtaLabel: invoiceUrl ? (lang === 'pt-BR' ? 'Ver recibo' : 'View receipt') : undefined,
    secondaryCtaUrl: invoiceUrl || undefined,
    note:
      lang === 'pt-BR'
        ? 'Se você precisar do comprovante, ele continua disponível na área de cobrança.'
        : 'If you need the receipt later, it remains available in billing.',
  });
}

function buildPaymentFailed(payload: EmailPayload, lang: RenderLang, appUrl: string): EmailResult {
  const retryDate = String(payload['retryDate'] ?? '');

  return renderBrandedEmail({
    locale: lang,
    subject: lang === 'pt-BR' ? 'atlas.core — falha no pagamento' : 'atlas.core — payment failed',
    preheader:
      lang === 'pt-BR'
        ? 'Atualize seus dados de cobrança para evitar interrupção.'
        : 'Update billing details to avoid interruption.',
    headline:
      lang === 'pt-BR'
        ? 'Falha no pagamento'
        : 'Payment failed',
    body:
      lang === 'pt-BR'
        ? [
            'Não foi possível processar seu pagamento.',
            'Atualize seus dados de cobrança agora para evitar interrupção do acesso.',
            retryDate ? `Nova tentativa prevista: ${retryDate}.` : 'Seu histórico continua preservado enquanto isso é resolvido.',
          ]
        : [
            'We could not process your payment.',
            'Update your billing details now to avoid an interruption in access.',
            retryDate ? `Next retry is scheduled for ${retryDate}.` : 'Your history remains preserved while this gets resolved.',
          ],
    ctaLabel: lang === 'pt-BR' ? 'Atualizar pagamento' : 'Update payment',
    ctaUrl: `${appUrl}/billing`,
    note:
      lang === 'pt-BR'
        ? 'Se precisar de ajuda, responda este e-mail.'
        : 'If you need help, reply to this email.',
  });
}

function buildWeeklyReport(payload: EmailPayload, lang: RenderLang, appUrl: string): EmailResult {
  const workouts = Number(payload.weekWorkouts ?? 0);
  const nutritionDays = Number(payload.weekNutritionDays ?? 0);
  const currentStreak = Number(payload.currentStreak ?? 0);
  const weightChange =
    typeof payload.weightChange === 'number'
      ? payload.weightChange
      : undefined;
  const reportDateRange = String(payload['reportDateRange'] ?? '');

  const summary =
    workouts >= 3
      ? lang === 'pt-BR'
        ? 'Semana forte. Agora o valor está em ajustar a próxima decisão.'
        : 'Strong week. Now the value is in adjusting the next decision.'
      : workouts >= 1
        ? lang === 'pt-BR'
          ? 'Você apareceu. Agora transforme presença em padrão.'
          : 'You showed up. Now turn presence into pattern.'
        : lang === 'pt-BR'
          ? 'Semana vazia. A próxima ação resolve isso.'
          : 'Empty week. The next action fixes that.';

  const metrics =
    lang === 'pt-BR'
      ? [
          `Treinos registrados: ${workouts}.`,
          `Dias com nutrição registrada: ${nutritionDays}.`,
          `Sequência atual: ${currentStreak} dias.${weightChange !== undefined ? ` Variação de peso: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg.` : ''}`,
        ]
      : [
          `Workouts logged: ${workouts}.`,
          `Nutrition days logged: ${nutritionDays}.`,
          `Current streak: ${currentStreak} days.${weightChange !== undefined ? ` Weight change: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg.` : ''}`,
        ];

  return renderBrandedEmail({
    locale: lang,
    subject:
      lang === 'pt-BR'
        ? `atlas.core — sua semana${reportDateRange ? `, ${reportDateRange}` : ''}`
        : `atlas.core — your week${reportDateRange ? `, ${reportDateRange}` : ''}`,
    preheader:
      lang === 'pt-BR'
        ? 'Revise a semana. Encontre a falha. Ajuste.'
        : 'Review the week. Identify the gap. Adjust.',
    headline:
      lang === 'pt-BR'
        ? 'Sua semana'
        : 'Your week',
    body: [
      ...metrics,
      summary,
    ],
    ctaLabel: lang === 'pt-BR' ? 'Ver relatório' : 'View report',
    ctaUrl: appUrl,
    note:
      reportDateRange
        ? lang === 'pt-BR'
          ? `Período: ${reportDateRange}`
          : `Week: ${reportDateRange}`
        : undefined,
  });
}

function buildMilestone(payload: EmailPayload, lang: RenderLang, appUrl: string): EmailResult {
  const firstName = String(payload.firstName ?? (lang === 'pt-BR' ? 'Atleta' : 'Athlete'));
  const key = payload.milestoneKey ?? 'first_workout';

  const content: Record<NonNullable<EmailPayload['milestoneKey']>, { subject: string; headline: string; body: string[] }> = {
    first_workout: {
      subject: lang === 'pt-BR' ? 'atlas.core — primeiro treino registrado' : 'atlas.core — first workout logged',
      headline: lang === 'pt-BR' ? 'Primeiro treino registrado' : 'First workout logged',
      body:
        lang === 'pt-BR'
          ? [
              `${firstName}, o sistema começou a ganhar contexto real.`,
              'O primeiro treino não prova muito sozinho, mas marca o começo do padrão.',
              'Agora o trabalho é continuar.',
            ]
          : [
              `${firstName}, the system has started collecting real context.`,
              'One workout does not prove much on its own, but it marks the beginning of the pattern.',
              'Now the job is to keep going.',
            ],
    },
    workouts_5: {
      subject: lang === 'pt-BR' ? 'atlas.core — 5 treinos registrados' : 'atlas.core — 5 workouts logged',
      headline: lang === 'pt-BR' ? 'Cinco treinos registrados' : 'Five workouts logged',
      body:
        lang === 'pt-BR'
          ? [
              'Cinco sessões já são sinal de consistência.',
              'Agora o histórico começa a ficar útil para leitura de padrão, não só registro.',
              'Continue dando material para o sistema interpretar.',
            ]
          : [
              'Five sessions is already a consistency signal.',
              'Now the history starts becoming useful for pattern reading, not just record keeping.',
              'Keep giving the system material to interpret.',
            ],
    },
    workouts_10: {
      subject: lang === 'pt-BR' ? 'atlas.core — 10 treinos registrados' : 'atlas.core — 10 workouts logged',
      headline: lang === 'pt-BR' ? 'Dez treinos registrados' : 'Ten workouts logged',
      body:
        lang === 'pt-BR'
          ? [
              'Dez sessões já são contexto de verdade.',
              'Agora vale olhar volume, aderência e evolução com mais seriedade.',
              'Abra o app e revise o que merece ajuste.',
            ]
          : [
              'Ten sessions is real context.',
              'Now it is worth reading volume, adherence, and progression more seriously.',
              'Open the app and review what deserves an adjustment.',
            ],
    },
    streak_7: {
      subject: lang === 'pt-BR' ? 'atlas.core — sequência de 7 dias' : 'atlas.core — 7-day streak',
      headline: lang === 'pt-BR' ? 'Sequência de 7 dias' : '7-day streak',
      body:
        lang === 'pt-BR'
          ? [
              'Sete dias. Conquistados, não declarados.',
              'O valor aqui não é comemoração. É repetição.',
              'Proteja o padrão.',
            ]
          : [
              'Seven days. Earned, not claimed.',
              'The value here is not celebration. It is repetition.',
              'Protect the pattern.',
            ],
    },
    streak_14: {
      subject: lang === 'pt-BR' ? 'atlas.core — sequência de 14 dias' : 'atlas.core — 14-day streak',
      headline: lang === 'pt-BR' ? 'Sequência de 14 dias' : '14-day streak',
      body:
        lang === 'pt-BR'
          ? [
              'Duas semanas começam a parecer identidade.',
              'Agora o sistema já consegue separar impulso de comportamento real.',
              'Continue fazendo o básico bem feito.',
            ]
          : [
              'Two weeks starts to look like identity.',
              'Now the system can start separating impulse from real behavior.',
              'Keep doing the basics well.',
            ],
    },
    streak_30: {
      subject: lang === 'pt-BR' ? 'atlas.core — sequência de 30 dias' : 'atlas.core — 30-day streak',
      headline: lang === 'pt-BR' ? 'Sequência de 30 dias' : '30-day streak',
      body:
        lang === 'pt-BR'
          ? [
              'Trinta dias já não são empolgação.',
              'Isso é padrão consolidado.',
              'Agora vale usar esse histórico para decidir melhor.',
            ]
          : [
              'Thirty days is no longer excitement.',
              'That is an established pattern.',
              'Now it is worth using that history to make better decisions.',
            ],
    },
  };

  const selected = content[key];

  return renderBrandedEmail({
    locale: lang,
    subject: selected.subject,
    preheader: selected.body[0],
    headline: selected.headline,
    body: selected.body,
    ctaLabel: lang === 'pt-BR' ? 'Entrar no atlas.core' : 'Enter atlas.core',
    ctaUrl: appUrl,
  });
}

function build(type: EmailType, payload: EmailPayload, lang: RenderLang, appUrl: string): EmailResult {
  switch (type) {
    case 'welcome':
    case 'confirm_email':
    case 'reset_password':
    case 'trial_started':
    case 'trial_ending':
    case 'trial_expired':
    case 'inactivity_nudge':
      return buildStandardTemplate(type, { ...payload, appUrl }, lang);
    case 'payment_success':
      return buildPaymentSuccess(payload, lang, appUrl);
    case 'payment_failed':
      return buildPaymentFailed(payload, lang, appUrl);
    case 'weekly_report':
      return buildWeeklyReport(payload, lang, appUrl);
    case 'milestone':
      return buildMilestone(payload, lang, appUrl);
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}

async function isAuthorized(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return false;

  const token = authHeader.replace('Bearer ', '');
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (serviceKey && token === serviceKey) return true;

  const supabase = createClient(
    supabaseUrl,
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.id) return false;
  if (!serviceKey) return false;

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError) {
    console.warn('send-email: admin role lookup failed:', profileError.message);
    return false;
  }

  return profile?.role === 'admin';
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

  const appUrl =
    (payload.appUrl as string | undefined) ||
    Deno.env.get('APP_URL') ||
    'https://useatlascore.com';
  const lang = resolveLanguage(language);
  const fromAddress = Deno.env.get('FROM_EMAIL') || 'atlas.core <noreply@useatlascore.com>';

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
