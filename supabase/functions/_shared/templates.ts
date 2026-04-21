/**
 * Email templates for atlas.core
 * Localized (pt-BR / en) with variable interpolation and a single HTML renderer.
 */

type Locale = 'pt-BR' | 'en';

type LocalizedEmailTemplate = {
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

type EmailTemplateSet = Record<Locale, LocalizedEmailTemplate>;

const brand = {
  name: 'atlas.core',
  siteUrl: 'https://www.useatlascore.com',
  supportEmail: 'support@useatlascore.com',
  defaultLocale: 'pt-BR' as Locale,
  colors: {
    paper: '#F6F1E8',
    ink: '#0F0A05',
    sulfur: '#E7FF2B',
    white: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    border: 'rgba(15,10,5,0.12)',
    textPrimary: 'rgba(15,10,5,0.88)',
    textSecondary: 'rgba(15,10,5,0.62)',
  },
};

export const templates: Record<string, EmailTemplateSet> = {
  welcome: {
    'pt-BR': {
      subject: 'atlas.core — boas-vindas',
      preheader: 'Seu workspace está pronto.',
      headline: 'Bem-vindo ao atlas.core',
      body: [
        'Seu workspace está pronto.',
        'Tracking, treinos, nutrição, exames, composição corporal e protocolos já estão ativos.',
        'Comece limpo. Construa o padrão desde o início.',
      ],
      ctaLabel: 'Entrar no atlas.core',
      ctaUrl: `${brand.siteUrl}/app`,
      note: 'Você está recebendo este e-mail porque uma conta do atlas.core foi criada para este endereço.',
    },
    en: {
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
  },

  confirm_email: {
    'pt-BR': {
      subject: 'atlas.core — confirme sua conta',
      preheader: 'Confirme seu e-mail para ativar seu workspace.',
      headline: 'Confirme seu e-mail',
      body: [
        'Sua conta está pronta.',
        'Confirme seu e-mail para ativar seu workspace e continuar a configuração.',
      ],
      ctaLabel: 'Confirmar e-mail',
      ctaUrl: '{{confirm_email_url}}',
      note: 'Se você não criou esta conta, ignore este e-mail.',
    },
    en: {
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
  },

  reset_password: {
    'pt-BR': {
      subject: 'atlas.core — redefina sua senha',
      preheader: 'Use este link para definir uma nova senha.',
      headline: 'Redefina sua senha',
      body: [
        'Use o link abaixo para definir uma nova senha.',
        'Faça isso agora. Este link expira em breve.',
      ],
      ctaLabel: 'Redefinir senha',
      ctaUrl: '{{reset_password_url}}',
      note: 'Se você não solicitou esta redefinição, ignore este e-mail.',
    },
    en: {
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
  },

  trial_started: {
    'pt-BR': {
      subject: 'atlas.core — teste iniciado',
      preheader: 'Você agora tem acesso completo.',
      headline: 'Seu teste está ativo',
      body: [
        'Você agora tem acesso completo ao atlas.core.',
        'Use esse período direito. Tudo está liberado.',
      ],
      ctaLabel: 'Entrar no atlas.core',
      ctaUrl: `${brand.siteUrl}/app`,
      note: 'Seu teste termina em {{trial_end_date}}.',
    },
    en: {
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
  },

  trial_ending: {
    'pt-BR': {
      subject: 'atlas.core — faltam 2 dias',
      preheader: 'Seu teste termina em 2 dias.',
      headline: 'Faltam 2 dias',
      body: [
        'Seu teste termina em 2 dias.',
        'Faça o upgrade para manter acesso ao seu workspace, histórico, protocolos e relatórios.',
        'Não perca ritmo por causa de tarefa administrativa.',
      ],
      ctaLabel: 'Ver planos',
      ctaUrl: `${brand.siteUrl}/billing`,
      secondaryCtaLabel: 'Entrar no atlas.core',
      secondaryCtaUrl: `${brand.siteUrl}/app`,
      note: 'Nenhuma ação é necessária se você não pretende continuar.',
    },
    en: {
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
  },

  trial_expired: {
    'pt-BR': {
      subject: 'atlas.core — teste encerrado',
      preheader: 'Seu workspace está pausado até que você faça o upgrade.',
      headline: 'Teste encerrado',
      body: [
        'Seu workspace está pausado.',
        'Seus dados continuam intactos.',
        'Faça o upgrade para restaurar o acesso e continuar de onde parou.',
      ],
      ctaLabel: 'Fazer upgrade',
      ctaUrl: `${brand.siteUrl}/billing`,
      note: 'Seus dados foram preservados e voltarão a ficar disponíveis após o upgrade.',
    },
    en: {
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
  },

  payment_success: {
    'pt-BR': {
      subject: 'atlas.core — pagamento confirmado',
      preheader: 'Sua assinatura segue ativa.',
      headline: 'Pagamento confirmado',
      body: [
        'Seu pagamento foi processado com sucesso.',
        'Seu acesso segue ativo. Nenhuma outra ação é necessária.',
      ],
      ctaLabel: 'Abrir cobrança',
      ctaUrl: `${brand.siteUrl}/billing`,
      note: 'Recibo: {{receipt_id}}',
    },
    en: {
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
  },

  payment_failed: {
    'pt-BR': {
      subject: 'atlas.core — falha no pagamento',
      preheader: 'Atualize seus dados de cobrança para evitar interrupção.',
      headline: 'Falha no pagamento',
      body: [
        'Não foi possível processar seu pagamento.',
        'Atualize seus dados de cobrança agora para evitar interrupção.',
      ],
      ctaLabel: 'Atualizar pagamento',
      ctaUrl: `${brand.siteUrl}/billing`,
      note: 'Vamos tentar novamente em {{retry_date}}.',
    },
    en: {
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
  },

  subscription_canceled: {
    'pt-BR': {
      subject: 'atlas.core — assinatura cancelada',
      preheader: 'Sua assinatura foi cancelada.',
      headline: 'Assinatura cancelada',
      body: [
        'Sua assinatura foi cancelada.',
        'Seu acesso segue ativo até {{access_end_date}}.',
        'Depois disso, o workspace será pausado até a reativação.',
      ],
      ctaLabel: 'Reativar assinatura',
      ctaUrl: `${brand.siteUrl}/billing`,
      secondaryCtaLabel: 'Entrar no atlas.core',
      secondaryCtaUrl: `${brand.siteUrl}/app`,
      note: 'Seus dados permanecem intactos durante o período de cobrança atual.',
    },
    en: {
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
  },

  inactivity_nudge: {
    'pt-BR': {
      subject: 'atlas.core — volte para seu workspace',
      preheader: 'Seu workspace está parado.',
      headline: 'Seu workspace está parado',
      body: [
        'Você não acessa há algum tempo.',
        'Volte para o trabalho. Continue de onde parou.',
        'Você não está aqui para registrar dado por registrar.',
      ],
      ctaLabel: 'Entrar no atlas.core',
      ctaUrl: `${brand.siteUrl}/app`,
      note: 'Seu workspace continua disponível.',
    },
    en: {
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
  },

  weekly_report: {
    'pt-BR': {
      subject: 'atlas.core — sua semana, {{report_date_range}}',
      preheader: 'Revise a semana. Encontre a falha. Ajuste.',
      headline: 'Sua semana',
      body: [
        'Revise a semana. Encontre a falha. Ajuste.',
        'Métrica só importa se muda a próxima decisão.',
        'Abra o relatório e aja em cima dele.',
      ],
      ctaLabel: 'Ver relatório',
      ctaUrl: '{{weekly_report_url}}',
      note: 'Período: {{report_date_range}}',
    },
    en: {
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
  },

  milestone_streak_7: {
    'pt-BR': {
      subject: 'atlas.core — sequência de 7 dias',
      preheader: 'Sete dias. Conquistados, não declarados.',
      headline: 'Sequência de 7 dias',
      body: [
        'Sete dias. Conquistados, não declarados.',
        'A maioria para cedo. Você não.',
        'Mantenha o padrão onde ele pertence.',
      ],
      ctaLabel: 'Entrar no atlas.core',
      ctaUrl: `${brand.siteUrl}/app`,
      note: 'Sequência atual: 7 dias.',
    },
    en: {
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
  },

  invite_beta: {
    'pt-BR': {
      subject: 'atlas.core — acesso antecipado',
      preheader: 'Você foi convidado para o atlas.core.',
      headline: 'Acesso antecipado',
      body: [
        'Acesso antecipado, {{first_name}}.',
        'Estou construindo o atlas.core — um sistema de treino e saúde para atletas e os profissionais que gerenciam eles.',
        'Você faz parte de um grupo pequeno com acesso direto antes do lançamento.',
        'Seu acesso inclui tudo: tracking de atletas, treinos, nutrição, exames, composição corporal, fluxos para coaches, fluxos para clínicos e protocolos.',
        'Sem restrições.',
        'Use direito. Quebre, se precisar.',
        'Quero feedback direto: o que funciona, o que atrasa você e o que não deveria existir.',
      ],
      ctaLabel: 'Entrar no atlas.core',
      ctaUrl: '{{invite_url}}',
      note: 'Você está recebendo este e-mail porque foi convidado diretamente para o acesso antecipado. O convite expira em {{invite_expiry_date}}.',
    },
    en: {
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
  },

  founder_welcome: {
    'pt-BR': {
      subject: 'atlas.core — uma nota pessoal do fundador',
      preheader: 'Obrigado por baixar o atlas.core.',
      headline: 'Obrigado por baixar o atlas.core',
      body: [
        'Oi {{first_name}}, eu sou o Enzo, fundador do atlas.core.',
        'Criei este app porque eu estava cansado de ver treino, nutrição, exames e progresso espalhados em ferramentas desconectadas.',
        'Quis construir um sistema mais claro, mais honesto e realmente útil no dia a dia.',
        'Se você topar, eu adoraria acompanhar sua primeira experiência de perto e aprender com o que está funcionando e com o que está travando você.',
        'Qualquer resposta sua vai direto para mim e tem valor real no produto.',
      ],
      ctaLabel: 'Responder ao fundador',
      ctaUrl: 'mailto:{{reply_email}}',
      secondaryCtaLabel: 'Abrir atlas.core',
      secondaryCtaUrl: `${brand.siteUrl}/app`,
      note: 'Se estiver tudo bem para você, eu também posso fazer um check-in semanal durante seu primeiro mês no app. Preferências: {{reply_email}}.',
    },
    en: {
      subject: 'atlas.core — a personal note from the founder',
      preheader: 'Thank you for downloading atlas.core.',
      headline: 'Thank you for downloading atlas.core',
      body: [
        'Hi {{first_name}}, I am Enzo, the founder of atlas.core.',
        'I built this app because I was tired of seeing training, nutrition, labs, and progress split across disconnected tools.',
        'I wanted to build a system that feels clearer, more honest, and actually useful in day-to-day practice.',
        'If you are open to it, I would love to stay close to your first experience and learn what is working and what is slowing you down.',
        'Any reply goes directly to me and has real value for the product.',
      ],
      ctaLabel: 'Reply to the founder',
      ctaUrl: 'mailto:{{reply_email}}',
      secondaryCtaLabel: 'Open atlas.core',
      secondaryCtaUrl: `${brand.siteUrl}/app`,
      note: 'If you are comfortable with it, I can also follow up once a week during your first month in the app. Contact: {{reply_email}}.',
    },
  },

  founder_check_in: {
    'pt-BR': {
      subject: 'atlas.core — como está sua semana {{week_label}}?',
      preheader: 'Um check-in rápido do fundador.',
      headline: 'Como está sua semana {{week_label}}?',
      body: [
        'Oi {{first_name}}, passando para fazer um check-in rápido.',
        'Quero entender como sua experiência com o atlas.core está evoluindo agora que você já teve algum tempo real dentro do app.',
        'Se você puder, me diga o que está claro, o que está confuso e o que você gostaria que existisse.',
        'Feedback honesto aqui vale mais do que educação. Eu estou usando isso para lapidar o produto antes do lançamento.',
      ],
      ctaLabel: 'Enviar feedback',
      ctaUrl: '{{feedback_url}}',
      secondaryCtaLabel: 'Responder por e-mail',
      secondaryCtaUrl: 'mailto:{{reply_email}}',
      note: 'Este é um check-in pessoal do fundador durante seu primeiro mês. Se preferir não receber esse acompanhamento, basta responder este e-mail.',
    },
    en: {
      subject: 'atlas.core — how is week {{week_label}} going?',
      preheader: 'A quick founder check-in.',
      headline: 'How is week {{week_label}} going?',
      body: [
        'Hi {{first_name}}, sending you a quick check-in.',
        'I want to understand how your atlas.core experience is developing now that you have had some real time inside the app.',
        'If you can, tell me what feels clear, what feels confusing, and what you wish existed.',
        'Honest feedback is more useful than politeness here. I am using it to sharpen the product before launch.',
      ],
      ctaLabel: 'Send feedback',
      ctaUrl: '{{feedback_url}}',
      secondaryCtaLabel: 'Reply by email',
      secondaryCtaUrl: 'mailto:{{reply_email}}',
      note: 'This is a personal founder check-in during your first month. If you would rather not receive these follow-ups, just reply to this email.',
    },
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

const resolveTemplate = (templateKey: string, locale: Locale): LocalizedEmailTemplate => {
  const templateSet = templates[templateKey];
  if (!templateSet) throw new Error(`Unknown template: ${templateKey}`);
  return templateSet[locale] ?? templateSet[brand.defaultLocale] ?? templateSet['en'];
};

// ─── Renderer ─────────────────────────────────────────────────────────────────

export interface RenderedEmail {
  subject: string;
  preheader: string;
  html: string;
  text: string;
}

export function renderEmail(
  templateKey: string,
  locale: Locale = brand.defaultLocale,
  variables: Record<string, string> = {},
): RenderedEmail {
  const template = resolveTemplate(templateKey, locale);

  const subject = interpolate(template.subject, variables);
  const preheader = interpolate(template.preheader, variables);
  const headline = interpolate(template.headline, variables);
  const body = template.body.map((line) => interpolate(line, variables));
  const note = template.note ? interpolate(template.note, variables) : '';
  const ctaUrl = template.ctaUrl ? interpolate(template.ctaUrl, variables) : '';
  const secondaryCtaUrl = template.secondaryCtaUrl
    ? interpolate(template.secondaryCtaUrl, variables)
    : '';

  const lang = locale === 'pt-BR' ? 'pt-BR' : 'en';
  const fallbackLinkLabel =
    locale === 'pt-BR'
      ? 'Se o botão não funcionar, use este link:'
      : 'If the button does not work, use this link:';

  const html = `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light only" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:${brand.colors.paper};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;visibility:hidden;">
      ${escapeHtml(preheader)}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${brand.colors.paper};margin:0;padding:24px 0;">
      <tr>
        <td align="center" style="padding:0 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:${brand.colors.paper};border:1px solid ${brand.colors.border};">

            <!-- Wordmark -->
            <tr>
              <td style="padding:28px 28px 12px 28px;">
                <div style="font-family:'Arial Black','Helvetica Neue',Arial,sans-serif;font-size:22px;line-height:1;font-weight:800;letter-spacing:-0.04em;color:${brand.colors.ink};text-transform:lowercase;">
                  atlas<span style="color:${brand.colors.sulfur};">.</span>core
                </div>
              </td>
            </tr>

            <!-- Headline -->
            <tr>
              <td style="padding:8px 28px 0 28px;">
                <h1 style="margin:0;color:${brand.colors.ink};font-family:'Arial Black','Helvetica Neue',Arial,sans-serif;font-size:34px;line-height:1.02;font-weight:800;letter-spacing:-0.04em;text-transform:lowercase;">
                  ${escapeHtml(headline)}
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:18px 28px 0 28px;">
                ${body
                  .map(
                    (paragraph) =>
                      `<p style="margin:0 0 12px 0;color:${brand.colors.textPrimary};font-size:16px;line-height:1.6;">${escapeHtml(paragraph)}</p>`,
                  )
                  .join('\n                ')}
              </td>
            </tr>

            ${template.ctaLabel && ctaUrl ? `
            <!-- Primary CTA -->
            <tr>
              <td style="padding:20px 28px 0 28px;">
                <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:${brand.colors.ink};color:${brand.colors.paper};text-decoration:none;font-family:'Arial Black','Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:14px;font-weight:800;padding:14px 18px;border-radius:10px;letter-spacing:-0.02em;text-transform:lowercase;">${escapeHtml(template.ctaLabel)}</a>
              </td>
            </tr>` : ''}

            ${template.secondaryCtaLabel && secondaryCtaUrl ? `
            <!-- Secondary CTA -->
            <tr>
              <td style="padding:12px 28px 0 28px;">
                <a href="${escapeHtml(secondaryCtaUrl)}" style="display:inline-block;color:${brand.colors.ink};text-decoration:none;font-family:'Courier New',monospace;font-size:12px;line-height:18px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(template.secondaryCtaLabel)}</a>
              </td>
            </tr>` : ''}

            <!-- Divider -->
            <tr>
              <td style="padding:28px 28px 0 28px;">
                <div style="height:1px;background:${brand.colors.border};font-size:1px;line-height:1px;">&nbsp;</div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:16px 28px 28px 28px;">
                ${note ? `<p style="margin:0 0 10px 0;color:${brand.colors.textSecondary};font-family:'Courier New',monospace;font-size:11px;line-height:1.7;letter-spacing:0.04em;text-transform:uppercase;">${escapeHtml(note)}</p>` : ''}
                <p style="margin:0 0 10px 0;color:${brand.colors.textSecondary};font-size:13px;line-height:1.55;word-break:break-word;">
                  ${escapeHtml(fallbackLinkLabel)}<br />
                  <span style="color:${brand.colors.ink};">${escapeHtml(ctaUrl || brand.siteUrl)}</span>
                </p>
                <p style="margin:0;color:${brand.colors.textSecondary};font-family:'Courier New',monospace;font-size:11px;line-height:1.7;letter-spacing:0.04em;text-transform:uppercase;">
                  body · operating · system<br />
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

// ─── Legacy compat for email-service.ts ───────────────────────────────────────

export type EmailType =
  | 'welcome'
  | 'confirm_email'
  | 'trial_started'
  | 'reset_password'
  | 'invite_beta'
  | 'founder_welcome'
  | 'founder_check_in'
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
  const locale: Locale = (data['language'] as Locale) ?? brand.defaultLocale;

  const variables: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined && v !== null) variables[k] = String(v);
  }

  const remap: Record<string, Record<string, string>> = {
    confirm_email: { confirmUrl: 'confirm_email_url' },
    reset_password: { resetUrl: 'reset_password_url' },
    trial_started: { trialDaysLeft: 'trial_end_date' },
    invite_beta: { inviteUrl: 'invite_url', notes: 'first_name' },
    founder_welcome: { firstName: 'first_name', replyEmail: 'reply_email' },
    founder_check_in: {
      firstName: 'first_name',
      replyEmail: 'reply_email',
      feedbackUrl: 'feedback_url',
      weekLabel: 'week_label',
    },
    payment_failed: { billingUrl: 'billing_url' },
    subscription_canceled: { periodEnd: 'access_end_date' },
  };

  for (const [from, to] of Object.entries(remap[type] ?? {})) {
    if (variables[from] !== undefined) variables[to] = variables[from];
  }

  return renderEmail(type, locale, variables);
}
