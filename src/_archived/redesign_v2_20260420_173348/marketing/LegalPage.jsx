/**
 * LegalPage — shared typography + layout for legal pages (Terms / Privacy).
 *
 * Single source for the draft banner, last-updated line, section styling, and
 * paragraph/list rendering. Keeps Terms.jsx and Privacy.jsx free of style noise.
 */
import React from 'react';

export function LegalPage({ title, lastUpdated, children }) {
  return (
    <div
      style={{
        maxWidth: 820,
        margin: '0 auto',
        paddingBlock: 40,
        paddingInline: 'max(20px, env(safe-area-inset-left))',
      }}
    >
      <div style={{
        fontSize: 11.5, fontWeight: 700, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: 'hsl(var(--rd-accent))',
        marginBottom: 14,
      }}>
        Legal
      </div>
      <h1 style={{
        fontSize: 'clamp(30px, 5vw, 42px)',
        fontWeight: 800,
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
        margin: '0 0 10px',
        color: 'hsl(var(--rd-fg-primary))',
      }}>
        {title}
      </h1>
      <div style={{
        fontSize: 13, color: 'hsl(var(--rd-fg-muted))',
        marginBottom: 36,
      }}>
        Last updated: {lastUpdated}
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 32,
      }}>
        {children}
      </div>
    </div>
  );
}

export function LegalSection({ n, title, children }) {
  return (
    <section>
      <h2 style={{
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        lineHeight: 1.2,
        margin: '0 0 12px',
        color: 'hsl(var(--rd-fg-primary))',
      }}>
        <span style={{
          fontVariantNumeric: 'tabular-nums',
          color: 'hsl(var(--rd-fg-muted))',
          marginRight: 10,
          fontWeight: 600,
        }}>
          {n}.
        </span>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </section>
  );
}

export function LegalParagraph({ children }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: 14.5,
        color: 'hsl(var(--rd-fg-secondary))',
        lineHeight: 1.7,
      }}
    >
      {children}
    </p>
  );
}

export function LegalList({ items }) {
  return (
    <ul
      style={{
        margin: 0,
        paddingLeft: 0,
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            paddingLeft: 18,
            position: 'relative',
            fontSize: 14.5,
            color: 'hsl(var(--rd-fg-secondary))',
            lineHeight: 1.65,
          }}
        >
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: 0, top: 11,
              width: 6, height: 6, borderRadius: 9999,
              background: 'hsl(var(--rd-accent))',
            }}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}
