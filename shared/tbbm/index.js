import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  getLocaleFallbackChain,
  normalizeLocale,
} from '../localization.js';
import {
  TBBM_CATALOG,
  TBBM_CHANNELS,
  TBBM_SUPPORTED_LOCALES,
  TBBM_TEMPLATE_VERSION,
} from './catalog.js';

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIsoDate(value) {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
}

function resolveTemplate(templateId) {
  return TBBM_CATALOG[templateId] || null;
}

function resolveRenderer(template, channel, locale) {
  const channelDefinition = template.channels[channel];
  if (!channelDefinition) return null;

  for (const fallbackLocale of getLocaleFallbackChain(locale, SUPPORTED_LOCALES, DEFAULT_LOCALE)) {
    if (channelDefinition.locales[fallbackLocale]) {
      return {
        locale: fallbackLocale,
        render: channelDefinition.locales[fallbackLocale],
      };
    }
  }

  return null;
}

function validateRecipient(recipient) {
  if (isNonEmptyString(recipient)) {
    return true;
  }

  if (!recipient || typeof recipient !== 'object') {
    return false;
  }

  return Object.keys(recipient).length > 0;
}

export function validateEnvelope(envelope) {
  const errors = [];

  if (!envelope || typeof envelope !== 'object') {
    return ['Envelope must be an object'];
  }

  if (!isNonEmptyString(envelope.message_id)) {
    errors.push('message_id is required');
  }

  if (!isNonEmptyString(envelope.event_type)) {
    errors.push('event_type is required');
  }

  if (!TBBM_CHANNELS.includes(envelope.channel)) {
    errors.push(`channel must be one of: ${TBBM_CHANNELS.join(', ')}`);
  }

  if (!validateRecipient(envelope.to)) {
    errors.push('to must be a non-empty string or object');
  }

  if (!normalizeLocale(envelope.locale, TBBM_SUPPORTED_LOCALES)) {
    errors.push('locale must be a supported BCP47 tag');
  }

  if (!isNonEmptyString(envelope.template_id)) {
    errors.push('template_id is required');
  }

  if (!isNonEmptyString(envelope.template_version)) {
    errors.push('template_version is required');
  }

  if (!isIsoDate(envelope.created_at)) {
    errors.push('created_at must be an ISO date');
  }

  if (!isIsoDate(envelope.send_at)) {
    errors.push('send_at must be an ISO date');
  }

  if (!isNonEmptyString(envelope.trace_id)) {
    errors.push('trace_id is required');
  }

  if (!isNonEmptyString(envelope.idempotency_key)) {
    errors.push('idempotency_key is required');
  }

  if (!envelope.vars || typeof envelope.vars !== 'object' || Array.isArray(envelope.vars)) {
    errors.push('vars must be an object');
  }

  const template = resolveTemplate(envelope.template_id);
  if (!template) {
    errors.push(`Unknown template_id: ${envelope.template_id}`);
    return errors;
  }

  if (template.eventType !== envelope.event_type) {
    errors.push(
      `event_type "${envelope.event_type}" does not match template event "${template.eventType}"`
    );
  }

  const renderer = resolveRenderer(template, envelope.channel, envelope.locale);
  if (!renderer) {
    errors.push(
      `No template variant found for ${envelope.template_id}/${envelope.channel}/${envelope.locale}`
    );
  }

  if (envelope.vars && typeof envelope.vars === 'object') {
    for (const variable of template.requiredVars) {
      const value = envelope.vars[variable];
      if (value === undefined || value === null || value === '') {
        errors.push(`vars.${variable} is required`);
      }
    }
  }

  return errors;
}

export function renderMessage(envelope) {
  const errors = validateEnvelope(envelope);
  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  const template = resolveTemplate(envelope.template_id);
  const renderer = resolveRenderer(template, envelope.channel, envelope.locale);
  const content = renderer.render(envelope.vars, {
    channel: envelope.channel,
    locale: renderer.locale,
    templateId: envelope.template_id,
  });

  return {
    ...envelope,
    locale: renderer.locale,
    content,
  };
}

export function buildSampleEnvelope(templateId, locale = DEFAULT_LOCALE, channel = 'email', overrides = {}) {
  const template = resolveTemplate(templateId);
  if (!template) {
    throw new Error(`Unknown template: ${templateId}`);
  }

  const now = '2026-03-20T12:00:00.000Z';

  return {
    message_id: `msg-${templateId}-${channel}-${locale}`.toLowerCase(),
    event_type: template.eventType,
    channel,
    to: overrides.to || 'sample@atlascore.app',
    locale,
    template_id: templateId,
    template_version: TBBM_TEMPLATE_VERSION,
    vars: {
      ...template.sampleVars,
      ...(overrides.vars || {}),
    },
    created_at: now,
    send_at: now,
    trace_id: overrides.trace_id || `trace-${templateId}-${channel}-${locale}`.toLowerCase(),
    idempotency_key:
      overrides.idempotency_key || `idempotency-${templateId}-${channel}-${locale}`.toLowerCase(),
  };
}

export function validateCatalogCoverage() {
  const missing = [];
  const covered = [];

  for (const [templateId, template] of Object.entries(TBBM_CATALOG)) {
    for (const channel of TBBM_CHANNELS) {
      const channelDefinition = template.channels[channel];
      if (!channelDefinition) {
        missing.push(`${templateId}/${channel}`);
        continue;
      }

      for (const locale of TBBM_SUPPORTED_LOCALES) {
        if (!channelDefinition.locales[locale]) {
          missing.push(`${templateId}/${channel}/${locale}`);
        } else {
          covered.push(`${templateId}/${channel}/${locale}`);
        }
      }
    }
  }

  const total = covered.length + missing.length;

  return {
    total,
    covered,
    missing,
    coveragePct: total === 0 ? 0 : Number(((covered.length / total) * 100).toFixed(2)),
  };
}

export function listTbbmInventory() {
  return Object.entries(TBBM_CATALOG).map(([templateId, template]) => ({
    template_id: templateId,
    event_type: template.eventType,
    critical: template.critical,
    description: template.description,
    required_vars: template.requiredVars,
    channels: Object.keys(template.channels),
    locales: [...TBBM_SUPPORTED_LOCALES],
  }));
}

export function renderCatalogSamples() {
  const rendered = [];

  for (const templateId of Object.keys(TBBM_CATALOG)) {
    for (const channel of TBBM_CHANNELS) {
      for (const locale of TBBM_SUPPORTED_LOCALES) {
        rendered.push(renderMessage(buildSampleEnvelope(templateId, locale, channel)));
      }
    }
  }

  return rendered;
}

export {
  TBBM_CATALOG,
  TBBM_CHANNELS,
  TBBM_SUPPORTED_LOCALES,
  TBBM_TEMPLATE_VERSION,
};
