import React from 'react';
import { LockupH } from '../lib/brandMarks.jsx';
import { PaperThemeProvider, ACFonts, useACTheme } from '../lib/paper.jsx';

const HANDOFF_ITEMS = [
  {
    title: 'App Canvas',
    href: '/handoff/atlas-core-logo/project/index.html',
    note: '50 product screens plus the template-pack section from the handoff canvas.',
  },
  {
    title: 'Brand Sheet',
    href: '/handoff/atlas-core-logo/project/brand-sheet.jsx',
    note: 'Mark construction, lockups, favicon set, business card, and usage rules source.',
  },
  {
    title: 'Design System',
    href: '/handoff/atlas-core-logo/project/design-system.html',
    note: 'Typography, palette, spacing, controls, and component primitives.',
  },
  {
    title: 'Motion Spec',
    href: '/handoff/atlas-core-logo/project/Motion.html',
    note: 'Transition rules, animations, and motion-reference demos.',
  },
  {
    title: 'Charts',
    href: '/handoff/atlas-core-logo/project/Charts.html',
    note: 'Reference treatments for line, bar, and signal-driven chart styling.',
  },
  {
    title: 'Email Signature',
    href: '/handoff/atlas-core-logo/project/Email-Signature.html',
    note: 'Brand-consistent signature lockups for outbound email.',
  },
  {
    title: 'Spec Pack',
    href: '/handoff/atlas-core-logo/project/Spec%20Pack.html',
    note: 'Screen map, data model, features, and wiring notes from the exported spec pack.',
  },
  {
    title: 'README',
    href: '/handoff/atlas-core-logo/README.md',
    note: 'Original Claude Design handoff instructions bundled with the archive.',
  },
];

function HandoffCard({ title, href, note }) {
  const t = useACTheme();
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'block',
        textDecoration: 'none',
        color: t.ink,
        background: t.bg,
        border: `1px solid ${t.hair}`,
        padding: 24,
        minHeight: 186,
        boxShadow: '0 18px 40px rgba(10,10,10,0.08)',
      }}
    >
      <div
        style={{
          fontFamily: ACFonts.mono,
          fontSize: 10,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: t.accent,
          marginBottom: 10,
        }}
      >
        handoff
      </div>
      <div
        style={{
          fontFamily: ACFonts.brand,
          fontSize: 30,
          letterSpacing: -1,
          lineHeight: 0.92,
          textTransform: 'lowercase',
        }}
      >
        {title}
      </div>
      <p
        style={{
          margin: '14px 0 22px',
          fontSize: 14,
          lineHeight: 1.6,
          color: t.dim,
          maxWidth: 360,
        }}
      >
        {note}
      </p>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: t.ink,
          color: t.bg,
          padding: '10px 14px',
          fontFamily: ACFonts.mono,
          fontSize: 11,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        }}
      >
        open
        <span style={{ color: t.accent }}>↗</span>
      </div>
    </a>
  );
}

function V3DesignHandoffInner() {
  const t = useACTheme();
  return (
    <div
      style={{
        minHeight: '100vh',
        background: t.bg,
        color: t.ink,
        padding: '56px 32px 96px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            fontFamily: ACFonts.mono,
            fontSize: 10,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: 'rgba(40,30,20,0.6)',
            marginBottom: 18,
          }}
        >
          /// atlas.core · design handoff
        </div>
        <div style={{ marginBottom: 26 }}>
          <LockupH size={60} wsize={32} />
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: ACFonts.brand,
            fontSize: 76,
            letterSpacing: -3,
            lineHeight: 0.9,
            textTransform: 'lowercase',
            maxWidth: 860,
          }}
        >
          the handoff,
          <br />
          <span style={{ background: t.ink, color: t.bg, padding: '0 10px' }}>
            inside the repo.
          </span>
        </h1>
        <p
          style={{
            margin: '20px 0 0',
            maxWidth: 760,
            fontSize: 16,
            lineHeight: 1.7,
            color: 'rgba(40,30,20,0.82)',
          }}
        >
          This route exposes the Claude Design handoff bundle as reviewable pages in the
          running app. The translated v3 product screens already live in the main React
          implementation; these links cover the rest of the package: brand docs, motion,
          chart styling, lifecycle collateral, and the original canvas/export references.
        </p>

        <div
          style={{
            marginTop: 36,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 18,
          }}
        >
          {HANDOFF_ITEMS.map((item) => (
            <HandoffCard key={item.href} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function V3DesignHandoff() {
  return (
    <PaperThemeProvider>
      <V3DesignHandoffInner />
    </PaperThemeProvider>
  );
}
