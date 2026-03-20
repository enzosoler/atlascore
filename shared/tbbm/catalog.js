import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  formatDateValue,
  getLocaleDirection,
  normalizeLocale,
} from '../localization.js';

export const TBBM_CHANNELS = Object.freeze(['email', 'sms', 'push', 'in_app']);
export const TBBM_SUPPORTED_LOCALES = SUPPORTED_LOCALES;
export const TBBM_TEMPLATE_VERSION = '1';

const APP_NAME = 'Atlas Core';

const ROLE_LABELS = {
  'en-US': {
    student: 'student',
    client: 'client',
    patient: 'patient',
  },
  'pt-BR': {
    student: 'aluno',
    client: 'cliente',
    patient: 'paciente',
  },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function resolveFirstName(firstName, locale) {
  if (typeof firstName === 'string' && firstName.trim()) {
    return firstName.trim();
  }

  return locale === 'pt-BR' ? 'atleta' : 'athlete';
}

function formatTrialEndDate(locale, trialEndDate) {
  return formatDateValue(trialEndDate, locale, {
    dateStyle: 'long',
    timeZone: 'UTC',
  });
}

function formatDays(locale, days) {
  const pluralRules = new Intl.PluralRules(locale);
  const category = pluralRules.select(days);

  if (locale === 'pt-BR') {
    return `${days} ${category === 'one' ? 'dia' : 'dias'}`;
  }

  return `${days} ${category === 'one' ? 'day' : 'days'}`;
}

function resolveRoleLabel(locale, recipientRole) {
  const normalizedLocale = normalizeLocale(locale) || DEFAULT_LOCALE;
  return (
    ROLE_LABELS[normalizedLocale]?.[recipientRole] ||
    ROLE_LABELS[DEFAULT_LOCALE]?.[recipientRole] ||
    recipientRole
  );
}

function buildEmailHtml({ locale, subject, paragraphs, ctaLabel, ctaUrl }) {
  const direction = getLocaleDirection(locale);
  const renderedParagraphs = paragraphs
    .map((paragraph) => `<p style="margin:0 0 16px; line-height:1.6;">${escapeHtml(paragraph)}</p>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="${escapeHtml(locale)}" dir="${direction}">
  <body style="margin:0; padding:32px; background:#f6f7fb; color:#111827; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:20px; padding:32px;">
      <p style="margin:0 0 8px; font-size:12px; text-transform:uppercase; letter-spacing:0.08em; color:#6b7280;">${escapeHtml(APP_NAME)}</p>
      <h1 style="margin:0 0 20px; font-size:28px; line-height:1.2;">${escapeHtml(subject)}</h1>
      ${renderedParagraphs}
      <p style="margin:24px 0 0;">
        <a href="${escapeHtml(ctaUrl)}" style="display:inline-block; padding:12px 20px; border-radius:12px; background:#111827; color:#ffffff; text-decoration:none; font-weight:600;">${escapeHtml(ctaLabel)}</a>
      </p>
    </div>
  </body>
</html>`;
}

function buildWelcomeCopy(locale, vars) {
  const firstName = resolveFirstName(vars.firstName, locale);
  const appUrl = vars.appUrl || 'https://atlascore.app';

  if (locale === 'pt-BR') {
    const subject = 'Boas-vindas ao Atlas Core';
    const bodyText = [
      `Olá ${firstName},`,
      '',
      'Sua conta está pronta.',
      'O Atlas Core organiza treino, nutrição, progresso e protocolos em um sistema só.',
      '',
      `Abrir o app: ${appUrl}`,
    ].join('\n');

    return {
      subject,
      bodyText,
      bodyHtml: buildEmailHtml({
        locale,
        subject,
        paragraphs: [
          `Olá ${firstName},`,
          'Sua conta está pronta.',
          'O Atlas Core organiza treino, nutrição, progresso e protocolos em um sistema só.',
        ],
        ctaLabel: 'Abrir Atlas Core',
        ctaUrl: appUrl,
      }),
      pushTitle: 'Conta criada',
      pushBody: 'Seu Atlas Core já está pronto para uso.',
      smsBody: `Atlas Core: sua conta está pronta. Abra ${appUrl}`,
      inAppTitle: 'Bem-vindo ao Atlas Core',
      inAppBody: 'Seu ambiente está pronto. Comece pelo Today e finalize o onboarding.',
      ctaLabel: 'Abrir app',
      ctaUrl: appUrl,
    };
  }

  const subject = 'Welcome to Atlas Core';
  const bodyText = [
    `Hi ${firstName},`,
    '',
    'Your account is ready.',
    'Atlas Core keeps training, nutrition, progress, and protocols in one clear system.',
    '',
    `Open the app: ${appUrl}`,
  ].join('\n');

  return {
    subject,
    bodyText,
    bodyHtml: buildEmailHtml({
      locale,
      subject,
      paragraphs: [
        `Hi ${firstName},`,
        'Your account is ready.',
        'Atlas Core keeps training, nutrition, progress, and protocols in one clear system.',
      ],
      ctaLabel: 'Open Atlas Core',
      ctaUrl: appUrl,
    }),
    pushTitle: 'Account ready',
    pushBody: 'Your Atlas Core workspace is ready to go.',
    smsBody: `Atlas Core: your account is ready. Open ${appUrl}`,
    inAppTitle: 'Welcome to Atlas Core',
    inAppBody: 'Your workspace is ready. Start with Today and finish onboarding.',
    ctaLabel: 'Open app',
    ctaUrl: appUrl,
  };
}

function buildTrialEndingCopy(locale, vars) {
  const firstName = resolveFirstName(vars.firstName, locale);
  const days = Number(vars.days ?? 0);
  const trialEndDate = formatTrialEndDate(locale, vars.trialEndDate);
  const billingUrl = vars.billingUrl || 'https://atlascore.app/pricing';
  const daysLabel = formatDays(locale, days);

  if (locale === 'pt-BR') {
    const subject = `Seu trial termina em ${daysLabel}`;
    const bodyText = [
      `Olá ${firstName},`,
      '',
      `Seu trial termina em ${daysLabel}, em ${trialEndDate}.`,
      'Faça o upgrade para manter acesso aos recursos premium.',
      '',
      `Atualizar plano: ${billingUrl}`,
    ].join('\n');

    return {
      subject,
      bodyText,
      bodyHtml: buildEmailHtml({
        locale,
        subject,
        paragraphs: [
          `Olá ${firstName},`,
          `Seu trial termina em ${daysLabel}, em ${trialEndDate}.`,
          'Faça o upgrade para manter acesso aos recursos premium.',
        ],
        ctaLabel: 'Atualizar plano',
        ctaUrl: billingUrl,
      }),
      pushTitle: 'Trial perto do fim',
      pushBody: `Seu trial termina em ${daysLabel}.`,
      smsBody: `Atlas Core: seu trial termina em ${daysLabel}. Atualize em ${billingUrl}`,
      inAppTitle: 'Trial expira em breve',
      inAppBody: `Seu trial termina em ${daysLabel}. Faça upgrade para continuar com acesso premium.`,
      ctaLabel: 'Atualizar plano',
      ctaUrl: billingUrl,
    };
  }

  const subject = `Your trial ends in ${daysLabel}`;
  const bodyText = [
    `Hi ${firstName},`,
    '',
    `Your trial ends in ${daysLabel}, on ${trialEndDate}.`,
    'Upgrade now to keep access to premium features.',
    '',
    `Update plan: ${billingUrl}`,
  ].join('\n');

  return {
    subject,
    bodyText,
    bodyHtml: buildEmailHtml({
      locale,
      subject,
      paragraphs: [
        `Hi ${firstName},`,
        `Your trial ends in ${daysLabel}, on ${trialEndDate}.`,
        'Upgrade now to keep access to premium features.',
      ],
      ctaLabel: 'Update plan',
      ctaUrl: billingUrl,
    }),
    pushTitle: 'Trial ending soon',
    pushBody: `Your trial ends in ${daysLabel}.`,
    smsBody: `Atlas Core: your trial ends in ${daysLabel}. Upgrade at ${billingUrl}`,
    inAppTitle: 'Trial expires soon',
    inAppBody: `Your trial ends in ${daysLabel}. Upgrade now to keep premium access.`,
    ctaLabel: 'Update plan',
    ctaUrl: billingUrl,
  };
}

function buildInviteCopy(locale, vars) {
  const recipientName = vars.recipientName?.trim() || (locale === 'pt-BR' ? 'profissional' : 'professional');
  const inviterName = vars.inviterName?.trim() || APP_NAME;
  const inviteLink = vars.inviteLink || 'https://atlascore.app/auth?mode=signup';
  const roleLabel = resolveRoleLabel(locale, vars.recipientRole);

  if (locale === 'pt-BR') {
    const subject = `${inviterName} convidou você para o Atlas Core`;
    const bodyText = [
      `Olá ${recipientName},`,
      '',
      `${inviterName} convidou você para entrar no Atlas Core como ${roleLabel}.`,
      '',
      `Aceitar convite: ${inviteLink}`,
    ].join('\n');

    return {
      subject,
      bodyText,
      bodyHtml: buildEmailHtml({
        locale,
        subject,
        paragraphs: [
          `Olá ${recipientName},`,
          `${inviterName} convidou você para entrar no Atlas Core como ${roleLabel}.`,
          'Use o link abaixo para aceitar o convite.',
        ],
        ctaLabel: 'Aceitar convite',
        ctaUrl: inviteLink,
      }),
      pushTitle: 'Novo convite',
      pushBody: `${inviterName} convidou você para o Atlas Core.`,
      smsBody: `Atlas Core: ${inviterName} enviou um convite. Aceite em ${inviteLink}`,
      inAppTitle: 'Convite disponível',
      inAppBody: `${inviterName} convidou você para entrar como ${roleLabel}.`,
      ctaLabel: 'Aceitar convite',
      ctaUrl: inviteLink,
    };
  }

  const subject = `${inviterName} invited you to Atlas Core`;
  const bodyText = [
    `Hi ${recipientName},`,
    '',
    `${inviterName} invited you to join Atlas Core as a ${roleLabel}.`,
    '',
    `Accept invite: ${inviteLink}`,
  ].join('\n');

  return {
    subject,
    bodyText,
    bodyHtml: buildEmailHtml({
      locale,
      subject,
      paragraphs: [
        `Hi ${recipientName},`,
        `${inviterName} invited you to join Atlas Core as a ${roleLabel}.`,
        'Use the link below to accept the invite.',
      ],
      ctaLabel: 'Accept invite',
      ctaUrl: inviteLink,
    }),
    pushTitle: 'New invite',
    pushBody: `${inviterName} invited you to Atlas Core.`,
    smsBody: `Atlas Core: ${inviterName} sent you an invite. Accept it at ${inviteLink}`,
    inAppTitle: 'Invite ready',
    inAppBody: `${inviterName} invited you to join as a ${roleLabel}.`,
    ctaLabel: 'Accept invite',
    ctaUrl: inviteLink,
  };
}

function createChannelVariants(copyBuilder, picker) {
  return Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [
      locale,
      (vars) => picker(copyBuilder(locale, vars)),
    ])
  );
}

export const TBBM_CATALOG = {
  welcome_user: {
    eventType: 'welcome_user',
    critical: true,
    description: 'Welcome message sent after account creation.',
    requiredVars: ['firstName', 'appUrl'],
    sampleVars: {
      firstName: 'Alex',
      appUrl: 'https://atlascore.app',
    },
    channels: {
      email: {
        locales: createChannelVariants(buildWelcomeCopy, (copy) => ({
          subject: copy.subject,
          bodyText: copy.bodyText,
          bodyHtml: copy.bodyHtml,
        })),
      },
      sms: {
        locales: createChannelVariants(buildWelcomeCopy, (copy) => ({
          bodyText: copy.smsBody,
        })),
      },
      push: {
        locales: createChannelVariants(buildWelcomeCopy, (copy) => ({
          title: copy.pushTitle,
          bodyText: copy.pushBody,
        })),
      },
      in_app: {
        locales: createChannelVariants(buildWelcomeCopy, (copy) => ({
          title: copy.inAppTitle,
          bodyText: copy.inAppBody,
          ctaLabel: copy.ctaLabel,
          ctaUrl: copy.ctaUrl,
        })),
      },
    },
  },
  trial_ends_soon: {
    eventType: 'trial_ends_soon',
    critical: true,
    description: 'Reminder sent three days before trial expiration.',
    requiredVars: ['firstName', 'days', 'trialEndDate', 'billingUrl'],
    sampleVars: {
      firstName: 'Alex',
      days: 3,
      trialEndDate: '2026-03-27T00:00:00.000Z',
      billingUrl: 'https://atlascore.app/pricing',
    },
    channels: {
      email: {
        locales: createChannelVariants(buildTrialEndingCopy, (copy) => ({
          subject: copy.subject,
          bodyText: copy.bodyText,
          bodyHtml: copy.bodyHtml,
        })),
      },
      sms: {
        locales: createChannelVariants(buildTrialEndingCopy, (copy) => ({
          bodyText: copy.smsBody,
        })),
      },
      push: {
        locales: createChannelVariants(buildTrialEndingCopy, (copy) => ({
          title: copy.pushTitle,
          bodyText: copy.pushBody,
        })),
      },
      in_app: {
        locales: createChannelVariants(buildTrialEndingCopy, (copy) => ({
          title: copy.inAppTitle,
          bodyText: copy.inAppBody,
          ctaLabel: copy.ctaLabel,
          ctaUrl: copy.ctaUrl,
        })),
      },
    },
  },
  invite_user: {
    eventType: 'invite_user',
    critical: true,
    description: 'Invitation message for staff and patient/client relationships.',
    requiredVars: ['recipientName', 'inviterName', 'inviteLink', 'recipientRole'],
    sampleVars: {
      recipientName: 'Jordan',
      inviterName: 'Camila',
      inviteLink: 'https://atlascore.app/auth?mode=signup&invite_code=invite-123',
      recipientRole: 'student',
    },
    channels: {
      email: {
        locales: createChannelVariants(buildInviteCopy, (copy) => ({
          subject: copy.subject,
          bodyText: copy.bodyText,
          bodyHtml: copy.bodyHtml,
        })),
      },
      sms: {
        locales: createChannelVariants(buildInviteCopy, (copy) => ({
          bodyText: copy.smsBody,
        })),
      },
      push: {
        locales: createChannelVariants(buildInviteCopy, (copy) => ({
          title: copy.pushTitle,
          bodyText: copy.pushBody,
        })),
      },
      in_app: {
        locales: createChannelVariants(buildInviteCopy, (copy) => ({
          title: copy.inAppTitle,
          bodyText: copy.inAppBody,
          ctaLabel: copy.ctaLabel,
          ctaUrl: copy.ctaUrl,
        })),
      },
    },
  },
};
