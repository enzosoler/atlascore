import { emailTokens } from './email-tokens.js';

const { brand } = emailTokens;

export const canonicalTemplateOrder = [
  'welcome',
  'onboarding_check_in',
  'confirm_identity',
  'reset_password',
  'email_confirmation',
  'magic_login',
  'security_alert',
  'trial_ending',
  'trial_ended',
  'subscription_activated',
  'payment_failed',
  'billing_receipt',
];

export const canonicalTemplates = {
  welcome: {
    kind: 'founder',
    'pt-BR': {
      subject: 'atlas.core — uma nota de boas-vindas',
      preheader: 'Uma mensagem curta do Enzo.',
      eyebrow: 'Founder email',
      headline: 'bem-vindo ao atlas.core',
      body: [
        'Eu criei o atlas.core para manter treino, nutrição e decisões de saúde dentro de um único sistema que vale a pena abrir todos os dias.',
        'Se quiser, responda este e-mail e me diga o que você quer melhorar primeiro. Eu leio essas respostas pessoalmente.',
      ],
      ctaLabel: 'Abrir atlas.core',
      ctaUrl: '{{app_url}}',
      signature: {
        signoff: 'Obrigado por entrar cedo,',
        name: brand.founderFullName,
        role: 'Founder, atlas.core',
      },
    },
    en: {
      subject: 'atlas.core — a welcome note',
      preheader: 'A short note from Enzo.',
      eyebrow: 'Founder email',
      headline: 'welcome to atlas.core',
      body: [
        'I built atlas.core to keep training, nutrition, and health decisions inside one system that is worth opening every day.',
        'If you want, reply to this email and tell me what you want to improve first. I read those replies myself.',
      ],
      ctaLabel: 'Open atlas.core',
      ctaUrl: '{{app_url}}',
      signature: {
        signoff: 'Thanks for getting in early,',
        name: brand.founderFullName,
        role: 'Founder, atlas.core',
      },
    },
  },
  onboarding_check_in: {
    kind: 'founder',
    'pt-BR': {
      subject: 'atlas.core — como está seu começo?',
      preheader: 'Um check-in curto do Enzo.',
      eyebrow: 'Founder check-in',
      headline: 'como está seu começo?',
      body: [
        'Agora que você já entrou algumas vezes, eu queria entender o que parece claro e o que ainda parece fraco ou confuso.',
        'Se você responder com franqueza, isso vai direto para o produto. Esse tipo de feedback muda decisões reais aqui.',
      ],
      ctaLabel: 'Responder ao Enzo',
      ctaUrl: 'mailto:{{reply_email}}',
      signature: {
        signoff: 'Fico no aguardo,',
        name: brand.founderFullName,
        role: 'Founder, atlas.core',
      },
    },
    en: {
      subject: 'atlas.core — how is the start going?',
      preheader: 'A short check-in from Enzo.',
      eyebrow: 'Founder check-in',
      headline: 'how is the start going?',
      body: [
        'Now that you have been inside a few times, I want to understand what feels clear and what still feels weak or confusing.',
        'If you reply honestly, that goes straight into the product. This kind of feedback changes real decisions here.',
      ],
      ctaLabel: 'Reply to Enzo',
      ctaUrl: 'mailto:{{reply_email}}',
      signature: {
        signoff: 'Looking forward to it,',
        name: brand.founderFullName,
        role: 'Founder, atlas.core',
      },
    },
  },
  confirm_identity: {
    kind: 'system',
    'pt-BR': {
      subject: 'atlas.core — confirme sua identidade',
      preheader: 'Use este código para continuar.',
      eyebrow: 'Identity check',
      headline: 'confirme sua identidade',
      body: [
        'Recebemos uma ação que precisa de confirmação antes de continuar.',
        'Use o código abaixo para provar que é você.',
      ],
      ctaLabel: 'Confirmar agora',
      ctaUrl: '{{confirm_identity_url}}',
      dataBlock: {
        title: 'Verification code',
        rows: [
          { label: 'Code', value: '{{otp_code}}' },
          { label: 'Expires', value: '{{expires_at}}' },
        ],
      },
    },
    en: {
      subject: 'atlas.core — confirm your identity',
      preheader: 'Use this code to continue.',
      eyebrow: 'Identity check',
      headline: 'confirm your identity',
      body: [
        'We received an action that needs confirmation before it can continue.',
        'Use the code below to prove it is you.',
      ],
      ctaLabel: 'Confirm now',
      ctaUrl: '{{confirm_identity_url}}',
      dataBlock: {
        title: 'Verification code',
        rows: [
          { label: 'Code', value: '{{otp_code}}' },
          { label: 'Expires', value: '{{expires_at}}' },
        ],
      },
    },
  },
  reset_password: {
    kind: 'system',
    'pt-BR': {
      subject: 'atlas.core — redefina sua senha',
      preheader: 'Seu link de recuperação está pronto.',
      eyebrow: 'Account access',
      headline: 'redefina sua senha',
      body: [
        'Recebemos um pedido para trocar a senha da sua conta.',
        'Use o botão abaixo para definir uma nova senha com segurança.',
      ],
      ctaLabel: 'Criar nova senha',
      ctaUrl: '{{reset_password_url}}',
      dataBlock: {
        title: 'Reset status',
        rows: [
          { label: 'Requested for', value: '{{email_address}}' },
          { label: 'Expires', value: '{{expires_at}}' },
        ],
      },
    },
    en: {
      subject: 'atlas.core — reset your password',
      preheader: 'Your recovery link is ready.',
      eyebrow: 'Account access',
      headline: 'reset your password',
      body: [
        'We received a request to change the password for your account.',
        'Use the button below to set a new password securely.',
      ],
      ctaLabel: 'Set new password',
      ctaUrl: '{{reset_password_url}}',
      dataBlock: {
        title: 'Reset status',
        rows: [
          { label: 'Requested for', value: '{{email_address}}' },
          { label: 'Expires', value: '{{expires_at}}' },
        ],
      },
    },
  },
  email_confirmation: {
    kind: 'system',
    'pt-BR': {
      subject: 'atlas.core — confirme seu e-mail',
      preheader: 'Falta um passo para liberar sua conta.',
      eyebrow: 'Email confirmation',
      headline: 'confirme seu e-mail',
      body: [
        'Sua conta já existe, mas o endereço ainda precisa ser confirmado.',
        'Faça isso agora para evitar qualquer problema de acesso depois.',
      ],
      ctaLabel: 'Confirmar e-mail',
      ctaUrl: '{{confirm_email_url}}',
      dataBlock: {
        title: 'Confirmation status',
        rows: [
          { label: 'Address', value: '{{email_address}}' },
          { label: 'Link expires', value: '{{expires_at}}' },
        ],
      },
    },
    en: {
      subject: 'atlas.core — confirm your email',
      preheader: 'One step remains before access is fully open.',
      eyebrow: 'Email confirmation',
      headline: 'confirm your email',
      body: [
        'Your account already exists, but the address still needs to be confirmed.',
        'Handle it now to avoid any access problems later.',
      ],
      ctaLabel: 'Confirm email',
      ctaUrl: '{{confirm_email_url}}',
      dataBlock: {
        title: 'Confirmation status',
        rows: [
          { label: 'Address', value: '{{email_address}}' },
          { label: 'Link expires', value: '{{expires_at}}' },
        ],
      },
    },
  },
  magic_login: {
    kind: 'system',
    'pt-BR': {
      subject: 'atlas.core — link mágico de acesso',
      preheader: 'Use este link para entrar sem senha.',
      eyebrow: 'Magic login',
      headline: 'entre com este link',
      body: [
        'Você pediu um acesso rápido sem senha.',
        'Use o botão abaixo para entrar direto na sua conta.',
      ],
      ctaLabel: 'Entrar no atlas.core',
      ctaUrl: '{{magic_login_url}}',
      dataBlock: {
        title: 'Login status',
        rows: [
          { label: 'Address', value: '{{email_address}}' },
          { label: 'Expires', value: '{{expires_at}}' },
        ],
      },
    },
    en: {
      subject: 'atlas.core — magic login link',
      preheader: 'Use this link to sign in without a password.',
      eyebrow: 'Magic login',
      headline: 'sign in with this link',
      body: [
        'You asked for a fast sign-in without a password.',
        'Use the button below to enter your account directly.',
      ],
      ctaLabel: 'Sign in to atlas.core',
      ctaUrl: '{{magic_login_url}}',
      dataBlock: {
        title: 'Login status',
        rows: [
          { label: 'Address', value: '{{email_address}}' },
          { label: 'Expires', value: '{{expires_at}}' },
        ],
      },
    },
  },
  security_alert: {
    kind: 'system',
    'pt-BR': {
      subject: 'atlas.core — alerta de segurança',
      preheader: 'Reveja esta atividade recente.',
      eyebrow: 'Security alert',
      headline: 'reveja esta atividade',
      body: [
        'Detectamos uma ação recente na sua conta que vale sua atenção.',
        'Se foi você, não precisa fazer nada. Se não foi, troque sua senha agora.',
      ],
      ctaLabel: 'Proteger conta',
      ctaUrl: '{{security_action_url}}',
      dataBlock: {
        title: 'Activity details',
        rows: [
          { label: 'Action', value: '{{alert_action}}' },
          { label: 'Time', value: '{{alert_time}}' },
          { label: 'Location', value: '{{alert_location}}' },
        ],
      },
    },
    en: {
      subject: 'atlas.core — security alert',
      preheader: 'Review this recent activity.',
      eyebrow: 'Security alert',
      headline: 'review this activity',
      body: [
        'We detected recent account activity that deserves your attention.',
        'If it was you, no action is needed. If it was not, change your password now.',
      ],
      ctaLabel: 'Secure account',
      ctaUrl: '{{security_action_url}}',
      dataBlock: {
        title: 'Activity details',
        rows: [
          { label: 'Action', value: '{{alert_action}}' },
          { label: 'Time', value: '{{alert_time}}' },
          { label: 'Location', value: '{{alert_location}}' },
        ],
      },
    },
  },
  trial_ending: {
    kind: 'system',
    'pt-BR': {
      subject: 'atlas.core — seu trial está terminando',
      preheader: 'Seu acesso atual acaba em breve.',
      eyebrow: 'Trial status',
      headline: 'seu trial está terminando',
      body: [
        'Seu período atual está perto do fim e o acesso Pro pode ser interrompido.',
        'Se o atlas.core já entrou na sua rotina, este é o momento de manter tudo ativo.',
      ],
      ctaLabel: 'Ver planos',
      ctaUrl: '{{billing_url}}',
      dataBlock: {
        title: 'Trial status',
        rows: [
          { label: 'Ends on', value: '{{trial_end_date}}' },
          { label: 'Plan', value: '{{plan_name}}' },
        ],
      },
    },
    en: {
      subject: 'atlas.core — your trial is ending',
      preheader: 'Your current access ends soon.',
      eyebrow: 'Trial status',
      headline: 'your trial is ending',
      body: [
        'Your current period is close to the end and Pro access may be interrupted.',
        'If atlas.core is already part of your routine, this is the moment to keep everything active.',
      ],
      ctaLabel: 'View plans',
      ctaUrl: '{{billing_url}}',
      dataBlock: {
        title: 'Trial status',
        rows: [
          { label: 'Ends on', value: '{{trial_end_date}}' },
          { label: 'Plan', value: '{{plan_name}}' },
        ],
      },
    },
  },
  trial_ended: {
    kind: 'system',
    'pt-BR': {
      subject: 'atlas.core — seu trial terminou',
      preheader: 'Seu acesso Pro foi pausado.',
      eyebrow: 'Trial status',
      headline: 'seu trial terminou',
      body: [
        'Seu acesso Pro foi pausado, mas seu histórico continua preservado.',
        'Se quiser continuar de onde parou, basta reativar o plano.',
      ],
      ctaLabel: 'Reativar acesso',
      ctaUrl: '{{billing_url}}',
      dataBlock: {
        title: 'Access status',
        rows: [
          { label: 'State', value: 'Paused' },
          { label: 'Data', value: 'Preserved' },
        ],
      },
    },
    en: {
      subject: 'atlas.core — your trial ended',
      preheader: 'Your Pro access is paused.',
      eyebrow: 'Trial status',
      headline: 'your trial ended',
      body: [
        'Your Pro access is paused, but your history is still preserved.',
        'If you want to continue where you left off, simply reactivate the plan.',
      ],
      ctaLabel: 'Reactivate access',
      ctaUrl: '{{billing_url}}',
      dataBlock: {
        title: 'Access status',
        rows: [
          { label: 'State', value: 'Paused' },
          { label: 'Data', value: 'Preserved' },
        ],
      },
    },
  },
  subscription_activated: {
    kind: 'system',
    'pt-BR': {
      subject: 'atlas.core — assinatura ativada',
      preheader: 'Seu acesso pago já está ativo.',
      eyebrow: 'Subscription status',
      headline: 'assinatura ativada',
      body: [
        'Seu pagamento foi confirmado e o acesso pago já está ativo.',
        'Nada mais é necessário agora. Seu workspace continua disponível sem interrupção.',
      ],
      ctaLabel: 'Abrir atlas.core',
      ctaUrl: '{{app_url}}',
      dataBlock: {
        title: 'Subscription status',
        rows: [
          { label: 'Plan', value: '{{plan_name}}' },
          { label: 'Renews on', value: '{{renewal_date}}' },
        ],
      },
    },
    en: {
      subject: 'atlas.core — subscription activated',
      preheader: 'Your paid access is already active.',
      eyebrow: 'Subscription status',
      headline: 'subscription activated',
      body: [
        'Your payment was confirmed and paid access is already active.',
        'Nothing else is needed now. Your workspace stays available without interruption.',
      ],
      ctaLabel: 'Open atlas.core',
      ctaUrl: '{{app_url}}',
      dataBlock: {
        title: 'Subscription status',
        rows: [
          { label: 'Plan', value: '{{plan_name}}' },
          { label: 'Renews on', value: '{{renewal_date}}' },
        ],
      },
    },
  },
  payment_failed: {
    kind: 'system',
    'pt-BR': {
      subject: 'atlas.core — pagamento falhou',
      preheader: 'Atualize sua cobrança para evitar interrupção.',
      eyebrow: 'Billing status',
      headline: 'pagamento falhou',
      body: [
        'Não conseguimos processar a cobrança mais recente da sua assinatura.',
        'Atualize seus dados agora para evitar qualquer pausa no acesso.',
      ],
      ctaLabel: 'Atualizar cobrança',
      ctaUrl: '{{billing_url}}',
      dataBlock: {
        title: 'Billing status',
        rows: [
          { label: 'Plan', value: '{{plan_name}}' },
          { label: 'Retry date', value: '{{retry_date}}' },
        ],
      },
    },
    en: {
      subject: 'atlas.core — payment failed',
      preheader: 'Update billing to avoid interruption.',
      eyebrow: 'Billing status',
      headline: 'payment failed',
      body: [
        'We could not process the most recent charge for your subscription.',
        'Update your details now to avoid any pause in access.',
      ],
      ctaLabel: 'Update billing',
      ctaUrl: '{{billing_url}}',
      dataBlock: {
        title: 'Billing status',
        rows: [
          { label: 'Plan', value: '{{plan_name}}' },
          { label: 'Retry date', value: '{{retry_date}}' },
        ],
      },
    },
  },
  billing_receipt: {
    kind: 'system',
    'pt-BR': {
      subject: 'atlas.core — recibo de cobrança',
      preheader: 'Seu recibo está disponível.',
      eyebrow: 'Billing receipt',
      headline: 'seu recibo está disponível',
      body: [
        'Registramos sua cobrança com sucesso e o recibo desta transação já está pronto.',
        'Use o botão abaixo se quiser revisar os detalhes completos da cobrança.',
      ],
      ctaLabel: 'Ver recibo',
      ctaUrl: '{{receipt_url}}',
      dataBlock: {
        title: 'Receipt details',
        rows: [
          { label: 'Receipt', value: '{{receipt_id}}' },
          { label: 'Amount', value: '{{amount}}' },
          { label: 'Date', value: '{{receipt_date}}' },
        ],
      },
    },
    en: {
      subject: 'atlas.core — billing receipt',
      preheader: 'Your receipt is ready.',
      eyebrow: 'Billing receipt',
      headline: 'your receipt is ready',
      body: [
        'We recorded your charge successfully and the receipt for this transaction is now available.',
        'Use the button below if you want to review the full billing details.',
      ],
      ctaLabel: 'View receipt',
      ctaUrl: '{{receipt_url}}',
      dataBlock: {
        title: 'Receipt details',
        rows: [
          { label: 'Receipt', value: '{{receipt_id}}' },
          { label: 'Amount', value: '{{amount}}' },
          { label: 'Date', value: '{{receipt_date}}' },
        ],
      },
    },
  },
};

export const legacyTemplates = {
  trial_started: {
    kind: 'system',
    'pt-BR': {
      subject: 'atlas.core — seu trial começou',
      preheader: 'Seu acesso atual já está liberado.',
      eyebrow: 'Trial status',
      headline: 'seu trial começou',
      body: [
        'Seu acesso Pro foi liberado e tudo já está disponível para uso.',
        'Use estes primeiros dias para decidir se o atlas.core merece virar parte fixa da sua rotina.',
      ],
      ctaLabel: 'Abrir atlas.core',
      ctaUrl: '{{app_url}}',
      dataBlock: {
        title: 'Trial status',
        rows: [
          { label: 'Ends on', value: '{{trial_end_date}}' },
          { label: 'Plan', value: '{{plan_name}}' },
        ],
      },
    },
    en: {
      subject: 'atlas.core — your trial started',
      preheader: 'Your current access is already open.',
      eyebrow: 'Trial status',
      headline: 'your trial started',
      body: [
        'Your Pro access is open and everything is already available to use.',
        'Use these first days to decide whether atlas.core deserves a fixed place in your routine.',
      ],
      ctaLabel: 'Open atlas.core',
      ctaUrl: '{{app_url}}',
      dataBlock: {
        title: 'Trial status',
        rows: [
          { label: 'Ends on', value: '{{trial_end_date}}' },
          { label: 'Plan', value: '{{plan_name}}' },
        ],
      },
    },
  },
  payment_success: {
    kind: 'system',
    'pt-BR': {
      subject: 'atlas.core — pagamento confirmado',
      preheader: 'Seu pagamento foi confirmado.',
      eyebrow: 'Billing status',
      headline: 'pagamento confirmado',
      body: [
        'Seu pagamento foi confirmado e sua assinatura continua ativa.',
        'Se quiser revisar os detalhes, o recibo está disponível no link abaixo.',
      ],
      ctaLabel: 'Ver recibo',
      ctaUrl: '{{receipt_url}}',
      dataBlock: {
        title: 'Receipt details',
        rows: [
          { label: 'Receipt', value: '{{receipt_id}}' },
          { label: 'Amount', value: '{{amount}}' },
        ],
      },
    },
    en: {
      subject: 'atlas.core — payment confirmed',
      preheader: 'Your payment was confirmed.',
      eyebrow: 'Billing status',
      headline: 'payment confirmed',
      body: [
        'Your payment was confirmed and your subscription remains active.',
        'If you want to review the details, the receipt is available from the link below.',
      ],
      ctaLabel: 'View receipt',
      ctaUrl: '{{receipt_url}}',
      dataBlock: {
        title: 'Receipt details',
        rows: [
          { label: 'Receipt', value: '{{receipt_id}}' },
          { label: 'Amount', value: '{{amount}}' },
        ],
      },
    },
  },
  subscription_canceled: {
    kind: 'system',
    'pt-BR': {
      subject: 'atlas.core — assinatura cancelada',
      preheader: 'Seu cancelamento foi registrado.',
      eyebrow: 'Subscription status',
      headline: 'assinatura cancelada',
      body: [
        'Seu cancelamento foi registrado, mas o acesso segue ativo até o fim do período atual.',
        'Se você mudar de ideia antes disso, a reativação é imediata.',
      ],
      ctaLabel: 'Reativar assinatura',
      ctaUrl: '{{billing_url}}',
      dataBlock: {
        title: 'Subscription status',
        rows: [
          { label: 'Access until', value: '{{access_end_date}}' },
          { label: 'State', value: 'Cancels at period end' },
        ],
      },
    },
    en: {
      subject: 'atlas.core — subscription canceled',
      preheader: 'Your cancellation was recorded.',
      eyebrow: 'Subscription status',
      headline: 'subscription canceled',
      body: [
        'Your cancellation was recorded, but access remains active until the current period ends.',
        'If you change your mind before then, reactivation is immediate.',
      ],
      ctaLabel: 'Reactivate subscription',
      ctaUrl: '{{billing_url}}',
      dataBlock: {
        title: 'Subscription status',
        rows: [
          { label: 'Access until', value: '{{access_end_date}}' },
          { label: 'State', value: 'Cancels at period end' },
        ],
      },
    },
  },
  inactivity_nudge: {
    kind: 'system',
    'pt-BR': {
      subject: 'atlas.core — volte para seu sistema',
      preheader: 'Seu sistema está parado há alguns dias.',
      eyebrow: 'Activity status',
      headline: 'volte para seu sistema',
      body: [
        'Você ficou alguns dias sem abrir o atlas.core e o contexto perde força quando isso acontece.',
        'Entre de novo, registre algo real e retome o padrão antes que a inércia vença.',
      ],
      ctaLabel: 'Entrar no atlas.core',
      ctaUrl: '{{app_url}}',
    },
    en: {
      subject: 'atlas.core — return to your system',
      preheader: 'Your system has been idle for a few days.',
      eyebrow: 'Activity status',
      headline: 'return to your system',
      body: [
        'You have been away from atlas.core for a few days and context gets weaker when that happens.',
        'Go back in, log something real, and restore the pattern before inertia wins.',
      ],
      ctaLabel: 'Open atlas.core',
      ctaUrl: '{{app_url}}',
    },
  },
  weekly_report: {
    kind: 'system',
    'pt-BR': {
      subject: 'atlas.core — seu relatório semanal',
      preheader: 'A semana está pronta para revisão.',
      eyebrow: 'Weekly report',
      headline: 'revise sua semana',
      body: [
        'Seu relatório semanal está pronto e já mostra onde houve consistência e onde houve perda de padrão.',
        'Abra o relatório e use isso para decidir a próxima semana com mais precisão.',
      ],
      ctaLabel: 'Abrir relatório',
      ctaUrl: '{{weekly_report_url}}',
      dataBlock: {
        title: 'Week summary',
        rows: [
          { label: 'Range', value: '{{report_date_range}}' },
          { label: 'Workouts', value: '{{week_workouts}}' },
        ],
      },
    },
    en: {
      subject: 'atlas.core — your weekly report',
      preheader: 'The week is ready for review.',
      eyebrow: 'Weekly report',
      headline: 'review your week',
      body: [
        'Your weekly report is ready and already shows where consistency held and where the pattern slipped.',
        'Open the report and use it to make the next week more precise.',
      ],
      ctaLabel: 'Open report',
      ctaUrl: '{{weekly_report_url}}',
      dataBlock: {
        title: 'Week summary',
        rows: [
          { label: 'Range', value: '{{report_date_range}}' },
          { label: 'Workouts', value: '{{week_workouts}}' },
        ],
      },
    },
  },
  invite_beta: {
    kind: 'founder',
    'pt-BR': {
      subject: 'atlas.core — convite de acesso',
      preheader: 'Você foi convidado para entrar.',
      eyebrow: 'Founder invite',
      headline: 'seu convite está pronto',
      body: [
        'Estou abrindo o atlas.core para um grupo pequeno antes do lançamento e você foi incluído nessa etapa.',
        'Entre, use com liberdade e me diga o que acelera você e o que atrasa você.',
      ],
      ctaLabel: 'Aceitar convite',
      ctaUrl: '{{invite_url}}',
      dataBlock: {
        title: 'Invite status',
        rows: [
          { label: 'Name', value: '{{first_name}}' },
          { label: 'Expires', value: '{{invite_expiry_date}}' },
        ],
      },
      signature: {
        signoff: 'Nos vemos lá dentro,',
        name: brand.founderFullName,
        role: 'Founder, atlas.core',
      },
    },
    en: {
      subject: 'atlas.core — access invitation',
      preheader: 'You have been invited in.',
      eyebrow: 'Founder invite',
      headline: 'your invitation is ready',
      body: [
        'I am opening atlas.core to a small group before launch and you are part of this stage.',
        'Come in, use it freely, and tell me what speeds you up and what slows you down.',
      ],
      ctaLabel: 'Accept invitation',
      ctaUrl: '{{invite_url}}',
      dataBlock: {
        title: 'Invite status',
        rows: [
          { label: 'Name', value: '{{first_name}}' },
          { label: 'Expires', value: '{{invite_expiry_date}}' },
        ],
      },
      signature: {
        signoff: 'See you inside,',
        name: brand.founderFullName,
        role: 'Founder, atlas.core',
      },
    },
  },
};

export const legacyTemplateAliases = {
  confirm_email: 'email_confirmation',
  founder_welcome: 'welcome',
  founder_check_in: 'onboarding_check_in',
  trial_expired: 'trial_ended',
};

export const previewVariables = {
  welcome: {
    app_url: `${brand.siteUrl}/app`,
  },
  onboarding_check_in: {
    reply_email: brand.founderReplyEmail,
  },
  confirm_identity: {
    confirm_identity_url: `${brand.siteUrl}/auth/verify`,
    otp_code: '483 201',
    expires_at: 'April 23, 2026 · 8:45 PM',
  },
  reset_password: {
    reset_password_url: `${brand.siteUrl}/auth/update-password?token=preview`,
    email_address: 'member@useatlascore.com',
    expires_at: 'April 23, 2026 · 8:45 PM',
  },
  email_confirmation: {
    confirm_email_url: `${brand.siteUrl}/auth/callback?mode=confirm&token=preview`,
    email_address: 'member@useatlascore.com',
    expires_at: 'April 23, 2026 · 8:45 PM',
  },
  magic_login: {
    magic_login_url: `${brand.siteUrl}/auth/login?token=preview`,
    email_address: 'member@useatlascore.com',
    expires_at: 'April 23, 2026 · 8:45 PM',
  },
  security_alert: {
    security_action_url: `${brand.siteUrl}/auth/security`,
    alert_action: 'New login',
    alert_time: 'April 23, 2026 · 8:12 PM',
    alert_location: 'San Diego, CA',
  },
  trial_ending: {
    billing_url: `${brand.siteUrl}/billing`,
    trial_end_date: 'April 25, 2026',
    plan_name: 'Pro Monthly',
  },
  trial_ended: {
    billing_url: `${brand.siteUrl}/billing`,
  },
  subscription_activated: {
    app_url: `${brand.siteUrl}/app`,
    plan_name: 'Pro Monthly',
    renewal_date: 'May 23, 2026',
  },
  payment_failed: {
    billing_url: `${brand.siteUrl}/billing`,
    plan_name: 'Pro Monthly',
    retry_date: 'April 26, 2026',
  },
  billing_receipt: {
    receipt_url: `${brand.siteUrl}/billing/receipt/preview`,
    receipt_id: 'RCP-2026-0423',
    amount: '$29.00 USD',
    receipt_date: 'April 23, 2026',
  },
  trial_started: {
    app_url: `${brand.siteUrl}/app`,
    trial_end_date: 'April 30, 2026',
    plan_name: 'Pro Trial',
  },
  payment_success: {
    receipt_url: `${brand.siteUrl}/billing/receipt/preview`,
    receipt_id: 'RCP-2026-0423',
    amount: '$29.00 USD',
  },
  subscription_canceled: {
    billing_url: `${brand.siteUrl}/billing`,
    access_end_date: 'May 23, 2026',
  },
  inactivity_nudge: {
    app_url: `${brand.siteUrl}/app`,
  },
  weekly_report: {
    weekly_report_url: `${brand.siteUrl}/app/insights`,
    report_date_range: 'Apr 17–23, 2026',
    week_workouts: '4',
  },
  invite_beta: {
    invite_url: `${brand.siteUrl}/invite?token=preview`,
    first_name: 'Member',
    invite_expiry_date: 'April 30, 2026',
  },
  founder_welcome: {
    app_url: `${brand.siteUrl}/app`,
  },
  founder_check_in: {
    reply_email: brand.founderReplyEmail,
  },
  confirm_email: {
    confirm_email_url: `${brand.siteUrl}/auth/callback?mode=confirm&token=preview`,
    email_address: 'member@useatlascore.com',
    expires_at: 'April 23, 2026 · 8:45 PM',
  },
  trial_expired: {
    billing_url: `${brand.siteUrl}/billing`,
  },
};

export const templates = canonicalTemplates;
