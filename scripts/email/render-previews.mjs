#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  canonicalTemplateOrder,
  previewVariables,
} from '../../supabase/functions/_shared/email-templates.js';
import { emailTokens } from '../../supabase/functions/_shared/email-tokens.js';
import { renderEmail } from '../../supabase/functions/_shared/email-renderer.js';

const outPath = path.resolve('docs/email-rebuild/email-approval-preview.html');

function escapeSrcdoc(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const entries = canonicalTemplateOrder.flatMap((templateKey) =>
  emailTokens.brand.locales.map((locale) => {
    const rendered = renderEmail(templateKey, locale, previewVariables[templateKey] ?? {});
    return {
      templateKey,
      locale,
      subject: rendered.subject,
      preheader: rendered.preheader,
      html: escapeSrcdoc(rendered.html),
    };
  }),
);

const cards = entries
  .map(
    (entry) => `<section class="card">
      <div class="meta">
        <p class="eyebrow">${entry.locale}</p>
        <h2>${entry.templateKey.replace(/_/g, ' ')}</h2>
        <p class="subject">${entry.subject}</p>
        <p class="preheader">${entry.preheader}</p>
      </div>
      <div class="frame">
        <iframe title="${entry.templateKey} ${entry.locale}" srcdoc="${entry.html}"></iframe>
      </div>
    </section>`,
  )
  .join('\n');

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>atlas.core email approval preview</title>
    <style>
      :root {
        --paper: ${emailTokens.colors.paper};
        --ink: ${emailTokens.colors.ink};
        --sulfur: ${emailTokens.colors.sulfur};
        --border: ${emailTokens.colors.border};
        --muted: ${emailTokens.colors.inkMuted};
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: var(--paper);
        color: var(--ink);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .page {
        max-width: 1400px;
        margin: 0 auto;
        padding: 32px 20px 56px;
      }
      .hero {
        margin-bottom: 28px;
      }
      .hero p {
        max-width: 740px;
        font-size: 16px;
        line-height: 1.6;
      }
      .eyebrow {
        margin: 0 0 10px;
        font: 700 11px/1.4 "Courier New", monospace;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--muted);
      }
      h1 {
        margin: 0;
        font-family: "Arial Black", "Helvetica Neue", Arial, sans-serif;
        font-size: clamp(42px, 7vw, 68px);
        line-height: 0.94;
        letter-spacing: -0.05em;
        text-transform: lowercase;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(560px, 1fr));
        gap: 18px;
      }
      .card {
        border: 1px solid var(--border);
        background: rgba(255,255,255,0.28);
      }
      .meta {
        padding: 18px 18px 12px;
        border-bottom: 1px solid var(--border);
      }
      .meta h2 {
        margin: 0 0 10px;
        font-family: "Arial Black", "Helvetica Neue", Arial, sans-serif;
        font-size: 26px;
        line-height: 1;
        letter-spacing: -0.04em;
        text-transform: lowercase;
      }
      .subject, .preheader {
        margin: 0 0 8px;
        font-size: 14px;
        line-height: 1.5;
      }
      .frame {
        padding: 16px;
      }
      iframe {
        width: 100%;
        min-height: 760px;
        border: 1px solid var(--border);
        background: white;
      }
      @media (max-width: 640px) {
        .grid { grid-template-columns: 1fr; }
        iframe { min-height: 680px; }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="hero">
        <p class="eyebrow">Email System Preview</p>
        <h1>atlas.core email approvals</h1>
        <p>Generated from the shared token, component, template, and renderer system. These previews render the canonical email set only.</p>
      </section>
      <section class="grid">
        ${cards}
      </section>
    </main>
  </body>
</html>`;

mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, html, 'utf8');
console.log(`Wrote ${outPath}`);
