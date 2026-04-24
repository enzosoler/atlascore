import { emailTokens } from './email-tokens.js';

const { colors, spacing, typography, brand } = emailTokens;

export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderRow(content, paddingBottom = '0') {
  return `<tr><td style="padding-bottom:${paddingBottom};">${content}</td></tr>`;
}

export function renderHeader() {
  return renderRow(
    `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="${typography.wordmark}color:${colors.ink};">
          atlas<span style="color:${colors.sulfur};">.</span>core
        </td>
      </tr>
    </table>`,
    spacing.headerBottom,
  );
}

export function renderHero(hero) {
  if (!hero) return '';
  return renderRow(
    `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid ${colors.border};">
      <tr>
        <td style="padding:16px 18px;${typography.meta}color:${colors.inkMuted};background-color:${colors.paper};">
          ${escapeHtml(hero)}
        </td>
      </tr>
    </table>`,
    spacing.block,
  );
}

export function renderEyebrow(text) {
  return renderRow(
    `<div style="${typography.meta}color:${colors.inkMuted};">${escapeHtml(text)}</div>`,
    '12px',
  );
}

export function renderHeadline(text) {
  return renderRow(
    `<div style="${typography.headline}color:${colors.ink};">${escapeHtml(text)}</div>`,
    spacing.block,
  );
}

export function renderBody(paragraphs) {
  return paragraphs
    .map((paragraph, index) =>
      renderRow(
        `<div style="${typography.body}color:${colors.inkSoft};">${escapeHtml(paragraph)}</div>`,
        index === paragraphs.length - 1 ? '0' : spacing.bodyGap,
      ),
    )
    .join('');
}

export function renderCta(cta, locale) {
  if (!cta?.label || !cta?.url) return '';

  const fallbackLabel =
    locale === 'pt-BR'
      ? 'Se o botão não funcionar, use este link:'
      : 'If the button does not work, use this link:';

  return [
    renderRow(
      `<table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td bgcolor="${colors.ink}">
            <a href="${escapeHtml(cta.url)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 20px;color:${colors.paper};text-decoration:none;${typography.button}">
              ${escapeHtml(cta.label)}
            </a>
          </td>
        </tr>
      </table>`,
      '12px',
    ),
    renderRow(
      `<div style="${typography.body}font-size:13px;line-height:21px;color:${colors.inkMuted};word-break:break-word;">
        ${escapeHtml(fallbackLabel)}<br />${escapeHtml(cta.url)}
      </div>`,
      '0',
    ),
  ].join('');
}

export function renderDataBlock(dataBlock) {
  if (!dataBlock?.rows?.length) return '';

  const title = dataBlock.title
    ? `<tr><td style="padding-bottom:12px;${typography.meta}color:${colors.inkMuted};">${escapeHtml(dataBlock.title)}</td></tr>`
    : '';

  const rows = dataBlock.rows
    .map(
      (row, index) => `<tr>
        <td style="padding-bottom:${index === dataBlock.rows.length - 1 ? '0' : spacing.dataRowGap};">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td valign="top" style="width:34%;padding-right:12px;${typography.meta}color:${colors.inkMuted};">${escapeHtml(row.label)}</td>
              <td valign="top" style="${typography.body}font-size:15px;line-height:22px;color:${colors.ink};">${escapeHtml(row.value)}</td>
            </tr>
          </table>
        </td>
      </tr>`,
    )
    .join('');

  return renderRow(
    `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid ${colors.border};">
      <tr>
        <td style="padding:16px 18px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            ${title}
            ${rows}
          </table>
        </td>
      </tr>
    </table>`,
    '0',
  );
}

export function renderSignature(signature) {
  if (!signature?.name) return '';

  const roleLine = signature.role
    ? `<tr><td style="${typography.meta}color:${colors.inkMuted};">${escapeHtml(signature.role)}</td></tr>`
    : '';
  const signoffLine = signature.signoff
    ? `<tr><td style="padding-bottom:8px;${typography.body}color:${colors.inkSoft};">${escapeHtml(signature.signoff)}</td></tr>`
    : '';

  return renderRow(
    `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid ${colors.border};">
      <tr><td style="font-size:0;line-height:0;height:18px;">&nbsp;</td></tr>
      ${signoffLine}
      <tr><td style="${typography.signatureName}color:${colors.ink};">${escapeHtml(signature.name)}</td></tr>
      ${roleLine}
    </table>`,
    '0',
  );
}

export function renderFooter(locale) {
  const supportLabel = locale === 'pt-BR' ? 'Suporte' : 'Support';

  return renderRow(
    `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid ${colors.border};">
      <tr><td style="font-size:0;line-height:0;height:${spacing.footerTop};">&nbsp;</td></tr>
      <tr>
        <td style="${typography.meta}color:${colors.inkMuted};">
          atlas.core / system
        </td>
      </tr>
      <tr>
        <td style="padding-top:8px;${typography.body}font-size:13px;line-height:21px;color:${colors.inkMuted};">
          ${escapeHtml(brand.name)} ·
          <a href="mailto:${escapeHtml(brand.supportEmail)}" style="color:${colors.inkMuted};text-decoration:none;">${escapeHtml(supportLabel)}: ${escapeHtml(brand.supportEmail)}</a> ·
          <a href="${escapeHtml(brand.siteUrl)}" style="color:${colors.inkMuted};text-decoration:none;">useatlascore.com</a>
        </td>
      </tr>
    </table>`,
    spacing.footerBottom,
  );
}

export const emailComponents = {
  header: renderHeader,
  eyebrow: renderEyebrow,
  headline: renderHeadline,
  body: renderBody,
  cta: renderCta,
  dataBlock: renderDataBlock,
  signature: renderSignature,
  footer: renderFooter,
};

