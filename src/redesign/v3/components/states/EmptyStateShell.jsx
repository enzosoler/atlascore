import React from 'react';
import { ACBtn, ACFonts, ACRadii, ACLabel, useACT } from '@/redesign/v3/lib/paper.jsx';

export default function EmptyStateShell({
  dark = false,
  eyebrow = 'Nothing here yet',
  title = 'This section is ready when you are.',
  description = 'Use the core loop first, then come back here when you need more depth.',
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}) {
  const c = useACT(dark);

  return (
    <div
      style={{
        padding: 18,
        background: c.card,
        borderRadius: ACRadii.card,
        border: `1px solid ${c.hair}`,
      }}
    >
      <ACLabel size={10} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
        {eyebrow}
      </ACLabel>
      <div style={{ marginTop: 8, fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.7, lineHeight: 1.1 }}>
        {title}
      </div>
      <div style={{ marginTop: 8, color: c.dim, fontSize: 14, lineHeight: 1.5 }}>
        {description}
      </div>
      {primaryLabel || secondaryLabel ? (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          {primaryLabel ? <ACBtn dark={dark} primary onClick={onPrimary}>{primaryLabel}</ACBtn> : null}
          {secondaryLabel ? <ACBtn dark={dark} onClick={onSecondary}>{secondaryLabel}</ACBtn> : null}
        </div>
      ) : null}
    </div>
  );
}
