import { emailTokens } from './email-tokens.js';
import {
  emailComponents,
  escapeHtml,
  renderHero,
} from './email-components.js';
import {
  canonicalTemplates,
  legacyTemplateAliases,
  legacyTemplates,
} from './email-templates.js';

const { brand, colors, spacing } = emailTokens;

export function interpolate(input, variables) {
  return String(input).replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) =>
    variables[key] ?? `{{${key}}}`,
  );
}

function interpolateRows(rows = [], variables = {}) {
  return rows
    .map((row) => ({
      label: interpolate(row.label, variables),
      value: interpolate(row.value, variables),
    }))
    .filter((row) => !/{{\s*[a-zA-Z0-9_]+\s*}}/.test(`${row.label}${row.value}`));
}

function normalizeTemplateKey(templateKey) {
  if (canonicalTemplates[templateKey]) return templateKey;
  if (legacyTemplates[templateKey]) return templateKey;
  if (legacyTemplateAliases[templateKey]) return legacyTemplateAliases[templateKey];
  throw new Error(`Unknown template: ${templateKey}`);
}

export function resolveTemplate(templateKey, locale = brand.defaultLocale) {
  const resolvedKey = normalizeTemplateKey(templateKey);
  const set = canonicalTemplates[resolvedKey] ?? legacyTemplates[resolvedKey];
  return {
    key: resolvedKey,
    kind: set.kind ?? 'system',
    template: set[locale] ?? set[brand.defaultLocale] ?? set.en,
  };
}

function normalizeDataBlock(dataBlock, note, secondaryCtaLabel, secondaryCtaUrl, variables) {
  const rows = dataBlock?.rows ? interpolateRows(dataBlock.rows, variables) : [];

  if (note) rows.push({ label: 'Note', value: note });
  if (secondaryCtaLabel && secondaryCtaUrl) {
    rows.push({ label: secondaryCtaLabel, value: secondaryCtaUrl });
  }

  if (!rows.length) return null;

  return {
    title: dataBlock?.title ? interpolate(dataBlock.title, variables) : '',
    rows,
  };
}

function normalizeSignature(kind, signature, locale) {
  if (kind !== 'founder') return null;
  if (!signature?.name) {
    return {
      signoff: locale === 'pt-BR' ? 'Enviado por,' : 'Sent by,',
      name: brand.founderFullName,
      role: 'Founder, atlas.core',
    };
  }

  return {
    signoff: signature.signoff ?? '',
    name: signature.name,
    role: signature.role ?? '',
  };
}

function normalizeBody(body) {
  return (Array.isArray(body) ? body : []).slice(0, 2).map((line) => String(line));
}

export function renderBrandedEmail(input) {
  const locale = input.locale ?? brand.defaultLocale;
  const kind = input.kind ?? 'system';
  const subject = input.subject ?? '';
  const preheader = input.preheader ?? '';
  const eyebrow =
    input.eyebrow ?? (kind === 'founder' ? 'Founder email' : 'System email');
  const headline = input.headline ?? '';
  const body = normalizeBody(input.body ?? []);
  const cta =
    input.cta ??
    (input.ctaLabel && input.ctaUrl
      ? { label: input.ctaLabel, url: input.ctaUrl }
      : null);
  const dataBlock = normalizeDataBlock(
    input.dataBlock,
    input.note ?? '',
    input.secondaryCtaLabel,
    input.secondaryCtaUrl,
    {},
  );
  const signature = normalizeSignature(kind, input.signature, locale);

  const sections = [
    emailComponents.header(),
    renderHero(input.hero),
    emailComponents.eyebrow(eyebrow),
    emailComponents.headline(headline),
    emailComponents.body(body),
    cta ? `<tr><td style="padding-top:${spacing.ctaTop};">${emailComponents.cta(cta, locale)}</td></tr>` : '',
    dataBlock ? `<tr><td style="padding-top:${spacing.block};">${emailComponents.dataBlock(dataBlock)}</td></tr>` : '',
    signature ? `<tr><td style="padding-top:${spacing.block};">${emailComponents.signature(signature)}</td></tr>` : '',
    `<tr><td>${emailComponents.footer(locale)}</td></tr>`,
  ]
    .filter(Boolean)
    .join('');

  const html = `<!doctype html>
<html lang="${locale === 'pt-BR' ? 'pt-BR' : 'en'}" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light only" />
    <title>${escapeHtml(subject)}</title>
    <style>
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
      table { border-collapse: collapse !important; }
      body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
      @media screen and (max-width: 600px) {
        .shell { width: 100% !important; }
        .shell-pad { padding-left: 20px !important; padding-right: 20px !important; }
      }
    </style>
  </head>
  <body style="margin:0 !important;padding:0 !important;background-color:${colors.paper};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(preheader)}</div>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${colors.paper};">
      <tr>
        <td align="center" style="padding:${spacing.outer} 12px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" class="shell" style="width:100%;max-width:560px;border:1px solid ${colors.border};background-color:${colors.paper};">
            <tr>
              <td class="shell-pad" style="padding:24px ${spacing.shellHorizontal} 0 ${spacing.shellHorizontal};">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  ${sections}
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    brand.name,
    eyebrow,
    '',
    headline,
    '',
    ...body,
    '',
    ...(cta?.label && cta?.url ? [`${cta.label}: ${cta.url}`, ''] : []),
    ...(dataBlock?.rows?.length
      ? [
          dataBlock.title || 'Details',
          ...dataBlock.rows.map((row) => `${row.label}: ${row.value}`),
          '',
        ]
      : []),
    ...(signature
      ? [signature.signoff, signature.name, signature.role, ''].filter(Boolean)
      : []),
    `${brand.name} · ${brand.siteUrl}`,
  ].join('\n');

  return { subject, preheader, html, text };
}

export function renderEmail(templateKey, locale = brand.defaultLocale, variables = {}) {
  const { kind, template } = resolveTemplate(templateKey, locale);
  const body = normalizeBody((template.body ?? []).map((line) => interpolate(line, variables)));
  const cta = template.ctaLabel && template.ctaUrl
    ? {
        label: interpolate(template.ctaLabel, variables),
        url: interpolate(template.ctaUrl, variables),
      }
    : null;
  const signature = template.signature
    ? {
        signoff: template.signature.signoff ? interpolate(template.signature.signoff, variables) : '',
        name: interpolate(template.signature.name, variables),
        role: template.signature.role ? interpolate(template.signature.role, variables) : '',
      }
    : null;
  const dataBlock = template.dataBlock
    ? {
        title: template.dataBlock.title ? interpolate(template.dataBlock.title, variables) : '',
        rows: interpolateRows(template.dataBlock.rows, variables),
      }
    : null;

  return renderBrandedEmail({
    locale,
    kind,
    subject: interpolate(template.subject, variables),
    preheader: interpolate(template.preheader, variables),
    eyebrow: interpolate(template.eyebrow, variables),
    headline: interpolate(template.headline, variables),
    body,
    cta,
    dataBlock,
    signature,
  });
}
